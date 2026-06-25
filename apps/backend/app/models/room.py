from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Room(SQLModel, table=True):
    """
    Represents a bookable campus room.

    Double-booking prevention is enforced via BorrowingService.detect_conflict().
    """

    __tablename__ = "rooms"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(max_length=50, unique=True, index=True)
    name: str = Field(max_length=200, index=True)
    capacity: int = Field(ge=1, default=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    is_active: bool = Field(default=True)
