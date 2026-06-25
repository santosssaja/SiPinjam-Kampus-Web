from datetime import date, time
from typing import Optional

from sqlmodel import Session, and_, select

from app.models.enums import LoanStatus, ResourceType
from app.models.loan import Loan


class LoanRepository:
    """
    Data access layer for Loan entities.
    Includes conflict-detection query used by BorrowingService.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, loan_id: int) -> Optional[Loan]:
        return self._session.get(Loan, loan_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Loan]:
        stmt = select(Loan).order_by(Loan.created_at.desc()).offset(skip).limit(limit)
        return list(self._session.exec(stmt).all())

    def get_by_borrower(
        self, borrower_id: int, skip: int = 0, limit: int = 100
    ) -> list[Loan]:
        stmt = (
            select(Loan)
            .where(Loan.borrower_id == borrower_id)
            .order_by(Loan.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self._session.exec(stmt).all())

    def get_conflicting_loans(
        self,
        resource_type: ResourceType,
        resource_id: int,
        loan_date: date,
        start_time: time,
        end_time: time,
        exclude_loan_id: Optional[int] = None,
    ) -> list[Loan]:
        """
        Return active loans that overlap with the requested time window.

        Overlap condition (A=existing, B=new):
            A.start_time < B.end_time AND A.end_time > B.start_time
        """
        active_statuses = [LoanStatus.PENDING, LoanStatus.APPROVED]

        stmt = select(Loan).where(
            and_(
                Loan.resource_type == resource_type,
                Loan.resource_id == resource_id,
                Loan.date == loan_date,
                Loan.status.in_(active_statuses),
                Loan.start_time < end_time,
                Loan.end_time > start_time,
            )
        )
        if exclude_loan_id is not None:
            stmt = stmt.where(Loan.id != exclude_loan_id)

        return list(self._session.exec(stmt).all())

    def count_approved_on_date(
        self,
        resource_type: ResourceType,
        resource_id: int,
        loan_date: date,
        start_time: time,
        end_time: time,
    ) -> int:
        """Count APPROVED loans overlapping with the given window (for quantity checks)."""
        conflicts = self.get_conflicting_loans(
            resource_type, resource_id, loan_date, start_time, end_time
        )
        return sum(1 for c in conflicts if c.status == LoanStatus.APPROVED)

    def create(self, loan: Loan) -> Loan:
        self._session.add(loan)
        self._session.commit()
        self._session.refresh(loan)
        return loan

    def update(self, loan: Loan) -> Loan:
        self._session.add(loan)
        self._session.commit()
        self._session.refresh(loan)
        return loan
