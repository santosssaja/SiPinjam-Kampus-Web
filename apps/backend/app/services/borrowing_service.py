"""
BorrowingService — Core domain service.

All business rules for loan lifecycle management live here:
  - Conflict detection (double booking, quantity exceeded)
  - Loan creation with pre-flight availability checks
  - Approval workflow (PENDING → APPROVED) with re-check
  - Rejection (PENDING → REJECTED)
  - Completion (APPROVED → COMPLETED)

Business rules enforced here (not in routes):
  1. Rooms cannot be double-booked.
  2. Item loans cannot exceed available quantity.
  3. Only ADMIN can approve / reject / complete.
  4. Every approval re-checks availability.
"""
from datetime import date, datetime, time, timezone
from typing import Optional

from fastapi import HTTPException, status

from app.models.enums import LoanStatus, ResourceType, UserRole
from app.models.loan import Loan
from app.models.user import User
from app.repositories.item_repository import ItemRepository
from app.repositories.loan_repository import LoanRepository
from app.repositories.room_repository import RoomRepository
from app.schemas.loan import AvailabilityResponse, LoanCreate


class BorrowingService:
    """
    Orchestrates all borrowing business logic.

    Dependencies are injected so the service remains testable in isolation.
    """

    def __init__(
        self,
        loan_repo: LoanRepository,
        item_repo: ItemRepository,
        room_repo: RoomRepository,
    ) -> None:
        self._loan_repo = loan_repo
        self._item_repo = item_repo
        self._room_repo = room_repo

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_all_loans(self, skip: int = 0, limit: int = 100) -> list[Loan]:
        return self._loan_repo.get_all(skip=skip, limit=limit)

    def get_loan_by_id(self, loan_id: int) -> Loan:
        loan = self._loan_repo.get_by_id(loan_id)
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Loan with ID {loan_id} not found",
            )
        return loan

    def get_loans_by_borrower(
        self, borrower_id: int, skip: int = 0, limit: int = 100
    ) -> list[Loan]:
        return self._loan_repo.get_by_borrower(
            borrower_id=borrower_id, skip=skip, limit=limit
        )

    def create_loan(self, data: LoanCreate, borrower: User) -> Loan:
        """
        Create a new loan request.

        Steps:
          1. Validate the resource exists.
          2. Detect any time-window conflicts.
          3. For items: check quantity constraint.
          4. Persist the loan in PENDING state.
        """
        self._validate_resource_exists(data.resource_type, data.resource_id)
        self.detect_conflict(
            data.resource_type, data.resource_id, data.date, data.start_time, data.end_time
        )

        if data.resource_type == ResourceType.ITEM:
            self._check_item_quantity(
                data.resource_id, data.date, data.start_time, data.end_time
            )

        loan = Loan(
            borrower_id=borrower.id,
            resource_type=data.resource_type,
            resource_id=data.resource_id,
            date=data.date,
            start_time=data.start_time,
            end_time=data.end_time,
            purpose=data.purpose,
            status=LoanStatus.PENDING,
        )
        return self._loan_repo.create(loan)

    def approve_loan(self, loan_id: int, admin: User) -> Loan:
        """
        Approve a PENDING loan.

        Re-checks availability at approval time to prevent race conditions.

        Raises:
            HTTPException 403 if caller is not ADMIN.
            HTTPException 404 if loan not found.
            HTTPException 409 if loan is not PENDING.
            HTTPException 409 if conflict detected at approval time.
        """
        self._require_admin(admin)
        loan = self.get_loan_by_id(loan_id)

        if loan.status != LoanStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot approve a loan with status '{loan.status.value}'",
            )

        # Re-check at approval time (business rule #5)
        self.detect_conflict(
            loan.resource_type,
            loan.resource_id,
            loan.date,
            loan.start_time,
            loan.end_time,
            exclude_loan_id=loan.id,
        )

        if loan.resource_type == ResourceType.ITEM:
            self._check_item_quantity(
                loan.resource_id,
                loan.date,
                loan.start_time,
                loan.end_time,
                exclude_loan_id=loan.id,
            )

        loan.status = LoanStatus.APPROVED
        loan.approved_by = admin.id
        loan.updated_at = datetime.now(timezone.utc)
        return self._loan_repo.update(loan)

    def reject_loan(self, loan_id: int, admin: User) -> Loan:
        """
        Reject a PENDING loan.

        Raises:
            HTTPException 403 if caller is not ADMIN.
            HTTPException 409 if loan is not PENDING.
        """
        self._require_admin(admin)
        loan = self.get_loan_by_id(loan_id)

        if loan.status != LoanStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot reject a loan with status '{loan.status.value}'",
            )

        loan.status = LoanStatus.REJECTED
        loan.approved_by = admin.id
        loan.updated_at = datetime.now(timezone.utc)
        return self._loan_repo.update(loan)

    def complete_loan(self, loan_id: int, admin: User) -> Loan:
        """
        Mark an APPROVED loan as COMPLETED (item returned / room released).

        Raises:
            HTTPException 403 if caller is not ADMIN.
            HTTPException 409 if loan is not APPROVED.
        """
        self._require_admin(admin)
        loan = self.get_loan_by_id(loan_id)

        if loan.status != LoanStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot complete a loan with status '{loan.status.value}'",
            )

        now = datetime.now(timezone.utc)
        loan.status = LoanStatus.COMPLETED
        loan.updated_at = now
        loan.actual_return_time = now

        # Calculate fine (e.g., 10000 IDR per hour late)
        # Using naive local time for expected return to simplify, 
        # but better to assume date and end_time are in local tz and compare with local now.
        local_now = datetime.now()
        expected_return = datetime.combine(loan.date, loan.end_time)
        
        if local_now > expected_return:
            delay_seconds = (local_now - expected_return).total_seconds()
            delay_hours = delay_seconds / 3600
            
            # 10,000 IDR per hour or partial hour
            import math
            loan.fine_amount = math.ceil(delay_hours) * 10000
        else:
            loan.fine_amount = 0

        return self._loan_repo.update(loan)

    def check_availability(
        self,
        resource_type: ResourceType,
        resource_id: int,
        loan_date: date,
        start_time: time,
        end_time: time,
    ) -> AvailabilityResponse:
        """
        Public availability check — used by the /loans/availability endpoint.
        Returns conflict count and whether the slot is free.
        """
        conflicts = self._loan_repo.get_conflicting_loans(
            resource_type=resource_type,
            resource_id=resource_id,
            loan_date=loan_date,
            start_time=start_time,
            end_time=end_time,
        )
        count = len(conflicts)

        if resource_type == ResourceType.ROOM:
            available = count == 0
            message = "Room is available" if available else f"Room has {count} conflicting reservation(s)"
        else:
            item = self._item_repo.get_by_id(resource_id)
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Item not found",
                )
            approved_count = sum(1 for c in conflicts if c.status == LoanStatus.APPROVED)
            available = approved_count < item.quantity
            message = (
                f"Item available ({item.quantity - approved_count} of {item.quantity} remaining)"
                if available
                else f"Item fully booked ({approved_count}/{item.quantity} in use)"
            )

        return AvailabilityResponse(
            available=available,
            conflicts=count,
            message=message,
        )

    def detect_conflict(
        self,
        resource_type: ResourceType,
        resource_id: int,
        loan_date: date,
        start_time: time,
        end_time: time,
        exclude_loan_id: Optional[int] = None,
    ) -> None:
        """
        Raise HTTPException if a booking conflict is detected.

        For ROOM: any overlap is a conflict.
        For ITEM: overlap only counts if approved loans reach quantity limit.
        """
        conflicts = self._loan_repo.get_conflicting_loans(
            resource_type=resource_type,
            resource_id=resource_id,
            loan_date=loan_date,
            start_time=start_time,
            end_time=end_time,
            exclude_loan_id=exclude_loan_id,
        )

        if resource_type == ResourceType.ROOM:
            # Rooms can only have ONE active booking per slot
            approved_conflicts = [c for c in conflicts if c.status == LoanStatus.APPROVED]
            if approved_conflicts:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Room is already booked for the requested time slot",
                )
        # For items the quantity check is a separate method

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _require_admin(self, user: User) -> None:
        if user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can perform this action",
            )

    def _validate_resource_exists(
        self, resource_type: ResourceType, resource_id: int
    ) -> None:
        if resource_type == ResourceType.ITEM:
            resource = self._item_repo.get_by_id(resource_id)
            if not resource or not resource.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Item with ID {resource_id} not found",
                )
        elif resource_type == ResourceType.ROOM:
            resource = self._room_repo.get_by_id(resource_id)
            if not resource or not resource.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Room with ID {resource_id} not found",
                )

    def _check_item_quantity(
        self,
        item_id: int,
        loan_date: date,
        start_time: time,
        end_time: time,
        exclude_loan_id: Optional[int] = None,
    ) -> None:
        """
        Raise HTTPException if approved loans for this item in the time window
        have reached the item's total quantity.
        """
        item = self._item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found",
            )

        conflicts = self._loan_repo.get_conflicting_loans(
            resource_type=ResourceType.ITEM,
            resource_id=item_id,
            loan_date=loan_date,
            start_time=start_time,
            end_time=end_time,
            exclude_loan_id=exclude_loan_id,
        )
        approved_count = sum(
            1 for c in conflicts if c.status == LoanStatus.APPROVED
        )

        if approved_count >= item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Item '{item.name}' has no available units for the requested time. "
                    f"({approved_count}/{item.quantity} already approved)"
                ),
            )
