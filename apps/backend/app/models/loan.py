from datetime import date, datetime, time, timezone
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.enums import LoanStatus, ResourceType


class Loan(SQLModel, table=True):
    """
    Represents a borrowing/reservation request.

    A single Loan covers either an ITEM borrow or a ROOM reservation.
    The combination of (resource_type, resource_id, date, start_time, end_time)
    is used for conflict detection in BorrowingService.
    """

    __tablename__ = "loans"

    id: Optional[int] = Field(default=None, primary_key=True)
    borrower_id: int = Field(foreign_key="users.id", index=True)
    resource_type: ResourceType
    resource_id: int = Field(index=True)

    # Temporal fields
    date: date
    start_time: time
    end_time: time

    # Meta
    purpose: str = Field(max_length=500)
    status: LoanStatus = Field(default=LoanStatus.PENDING)

    # Admin tracking
    approved_by: Optional[int] = Field(
        default=None, foreign_key="users.id", nullable=True
    )
    rejection_reason: Optional[str] = Field(default=None, max_length=500)

    # Return & Fine tracking
    actual_return_time: Optional[datetime] = Field(default=None)
    fine_amount: int = Field(default=0)
    is_fine_paid: bool = Field(default=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(default=None)
