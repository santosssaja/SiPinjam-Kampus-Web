from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):
    """
    Represents a borrowable laboratory equipment item.

    The `quantity` field tracks total available units.
    Conflict detection in BorrowingService ensures quantity
    is never exceeded during concurrent loans.
    """

    __tablename__ = "items"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(max_length=50, unique=True, index=True)
    name: str = Field(max_length=200, index=True)
    quantity: int = Field(ge=0, default=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    category: Optional[str] = Field(default=None, max_length=100)
    image_url: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    is_active: bool = Field(default=True)
