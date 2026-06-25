"""
Unit tests for BorrowingService.

Covers:
  - Room double-booking prevention
  - Item quantity validation
  - Full approval workflow (create → approve → complete)
  - Rejection workflow
  - Admin-only enforcement
"""
import pytest
from datetime import date, time

from fastapi import HTTPException

from app.models.enums import LoanStatus, ResourceType, UserRole
from app.models.item import Item
from app.models.room import Room
from app.schemas.loan import LoanCreate
from app.services.borrowing_service import BorrowingService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def make_item(session, code: str = "IT001", name: str = "Projector", quantity: int = 2) -> Item:
    item = Item(code=code, name=name, quantity=quantity)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def make_room(session, code: str = "R101", name: str = "Lab A") -> Room:
    room = Room(code=code, name=name, capacity=30)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


def make_loan_data(
    resource_type: ResourceType,
    resource_id: int,
    loan_date: date = date(2025, 8, 1),
    start_time: time = time(9, 0),
    end_time: time = time(11, 0),
) -> LoanCreate:
    return LoanCreate(
        resource_type=resource_type,
        resource_id=resource_id,
        date=loan_date,
        start_time=start_time,
        end_time=end_time,
        purpose="Test purpose",
    )


# ---------------------------------------------------------------------------
# Room conflict detection tests
# ---------------------------------------------------------------------------


class TestRoomConflictDetection:
    def test_room_booking_succeeds_when_no_conflict(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        room = make_room(session)
        data = make_loan_data(ResourceType.ROOM, room.id)
        loan = borrowing_service.create_loan(data, borrower_user)
        assert loan.id is not None
        assert loan.status == LoanStatus.PENDING

    def test_room_double_booking_blocked_on_approved_loans(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """Once a loan is APPROVED, the room slot is locked."""
        room = make_room(session)
        data1 = make_loan_data(ResourceType.ROOM, room.id)
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        # Approve the first loan
        borrowing_service.approve_loan(loan1.id, admin_user)

        # Second loan in the same window should fail
        data2 = make_loan_data(ResourceType.ROOM, room.id)
        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.create_loan(data2, borrower_user)
        assert exc_info.value.status_code == 409

    def test_room_adjacent_time_slots_allowed(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """Non-overlapping adjacent time slots should not conflict."""
        room = make_room(session)

        data1 = make_loan_data(
            ResourceType.ROOM, room.id, start_time=time(8, 0), end_time=time(10, 0)
        )
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        borrowing_service.approve_loan(loan1.id, admin_user)

        # Starts exactly when first one ends → no overlap
        data2 = make_loan_data(
            ResourceType.ROOM, room.id, start_time=time(10, 0), end_time=time(12, 0)
        )
        loan2 = borrowing_service.create_loan(data2, borrower_user)
        assert loan2.id is not None

    def test_room_partial_overlap_detected(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """Partial time overlap should still be detected."""
        room = make_room(session)

        data1 = make_loan_data(
            ResourceType.ROOM, room.id, start_time=time(9, 0), end_time=time(12, 0)
        )
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        borrowing_service.approve_loan(loan1.id, admin_user)

        data2 = make_loan_data(
            ResourceType.ROOM, room.id, start_time=time(11, 0), end_time=time(13, 0)
        )
        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.create_loan(data2, borrower_user)
        assert exc_info.value.status_code == 409

    def test_room_different_days_no_conflict(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """Same time slot on different dates should not conflict."""
        room = make_room(session)

        data1 = make_loan_data(ResourceType.ROOM, room.id, loan_date=date(2025, 8, 1))
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        borrowing_service.approve_loan(loan1.id, admin_user)

        data2 = make_loan_data(ResourceType.ROOM, room.id, loan_date=date(2025, 8, 2))
        loan2 = borrowing_service.create_loan(data2, borrower_user)
        assert loan2.id is not None


# ---------------------------------------------------------------------------
# Item quantity validation tests
# ---------------------------------------------------------------------------


class TestItemQuantityValidation:
    def test_item_borrow_succeeds_within_quantity(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session, quantity=3)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)
        assert loan.id is not None

    def test_item_borrow_fails_when_quantity_exceeded(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """With quantity=1, approving one loan should block the second."""
        item = make_item(session, quantity=1)

        data1 = make_loan_data(ResourceType.ITEM, item.id)
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        borrowing_service.approve_loan(loan1.id, admin_user)

        data2 = make_loan_data(ResourceType.ITEM, item.id)
        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.create_loan(data2, borrower_user)
        assert exc_info.value.status_code == 409

    def test_item_multiple_borrows_within_quantity(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """quantity=3 should allow 3 concurrent approved borrows."""
        item = make_item(session, quantity=3)

        for i in range(3):
            data = make_loan_data(ResourceType.ITEM, item.id)
            loan = borrowing_service.create_loan(data, borrower_user)
            borrowing_service.approve_loan(loan.id, admin_user)

        # The 4th should fail
        data4 = make_loan_data(ResourceType.ITEM, item.id)
        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.create_loan(data4, borrower_user)
        assert exc_info.value.status_code == 409

    def test_item_quantity_frees_after_completion(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        """
        After completing a loan, the slot should be available again
        (for a different time window — same-window completion is logical only
        but the quantity count of APPROVED loans drops).
        """
        item = make_item(session, quantity=1)
        data1 = make_loan_data(
            ResourceType.ITEM, item.id, start_time=time(9, 0), end_time=time(11, 0)
        )
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        borrowing_service.approve_loan(loan1.id, admin_user)
        borrowing_service.complete_loan(loan1.id, admin_user)

        # Different time window should succeed
        data2 = make_loan_data(
            ResourceType.ITEM, item.id, start_time=time(13, 0), end_time=time(15, 0)
        )
        loan2 = borrowing_service.create_loan(data2, borrower_user)
        assert loan2.id is not None


# ---------------------------------------------------------------------------
# Approval workflow tests
# ---------------------------------------------------------------------------


class TestApprovalWorkflow:
    def test_full_lifecycle_pending_approved_completed(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)

        loan = borrowing_service.create_loan(data, borrower_user)
        assert loan.status == LoanStatus.PENDING

        approved = borrowing_service.approve_loan(loan.id, admin_user)
        assert approved.status == LoanStatus.APPROVED
        assert approved.approved_by == admin_user.id

        completed = borrowing_service.complete_loan(loan.id, admin_user)
        assert completed.status == LoanStatus.COMPLETED

    def test_rejection_workflow(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)

        loan = borrowing_service.create_loan(data, borrower_user)
        rejected = borrowing_service.reject_loan(loan.id, admin_user)
        assert rejected.status == LoanStatus.REJECTED

    def test_cannot_approve_already_approved_loan(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)
        borrowing_service.approve_loan(loan.id, admin_user)

        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.approve_loan(loan.id, admin_user)
        assert exc_info.value.status_code == 409

    def test_cannot_complete_pending_loan(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)

        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.complete_loan(loan.id, admin_user)
        assert exc_info.value.status_code == 409

    def test_cannot_reject_approved_loan(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)
        borrowing_service.approve_loan(loan.id, admin_user)

        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.reject_loan(loan.id, admin_user)
        assert exc_info.value.status_code == 409


# ---------------------------------------------------------------------------
# Admin-only enforcement tests
# ---------------------------------------------------------------------------


class TestAdminOnlyEnforcement:
    def test_borrower_cannot_approve(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)

        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.approve_loan(loan.id, borrower_user)
        assert exc_info.value.status_code == 403

    def test_borrower_cannot_reject(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)

        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.reject_loan(loan.id, borrower_user)
        assert exc_info.value.status_code == 403

    def test_borrower_cannot_complete(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session)
        data = make_loan_data(ResourceType.ITEM, item.id)
        loan = borrowing_service.create_loan(data, borrower_user)
        borrowing_service.approve_loan(loan.id, admin_user)

        with pytest.raises(HTTPException) as exc_info:
            borrowing_service.complete_loan(loan.id, borrower_user)
        assert exc_info.value.status_code == 403


# ---------------------------------------------------------------------------
# Availability check tests
# ---------------------------------------------------------------------------


class TestAvailabilityCheck:
    def test_room_available_when_empty(
        self, session, borrowing_service: BorrowingService, borrower_user
    ):
        room = make_room(session)
        result = borrowing_service.check_availability(
            ResourceType.ROOM, room.id, date(2025, 8, 1), time(9, 0), time(11, 0)
        )
        assert result.available is True
        assert result.conflicts == 0

    def test_room_unavailable_when_approved_conflict(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        room = make_room(session)
        data = make_loan_data(ResourceType.ROOM, room.id)
        loan = borrowing_service.create_loan(data, borrower_user)
        borrowing_service.approve_loan(loan.id, admin_user)

        result = borrowing_service.check_availability(
            ResourceType.ROOM, room.id, date(2025, 8, 1), time(9, 0), time(11, 0)
        )
        assert result.available is False

    def test_item_availability_reflects_quantity(
        self, session, borrowing_service: BorrowingService, borrower_user, admin_user
    ):
        item = make_item(session, quantity=2)

        data1 = make_loan_data(ResourceType.ITEM, item.id)
        loan1 = borrowing_service.create_loan(data1, borrower_user)
        borrowing_service.approve_loan(loan1.id, admin_user)

        result = borrowing_service.check_availability(
            ResourceType.ITEM, item.id, date(2025, 8, 1), time(9, 0), time(11, 0)
        )
        # Still 1 left
        assert result.available is True

        data2 = make_loan_data(ResourceType.ITEM, item.id)
        loan2 = borrowing_service.create_loan(data2, borrower_user)
        borrowing_service.approve_loan(loan2.id, admin_user)

        result2 = borrowing_service.check_availability(
            ResourceType.ITEM, item.id, date(2025, 8, 1), time(9, 0), time(11, 0)
        )
        # All 2 used
        assert result2.available is False
