from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.enums import UserRole


class User(SQLModel, table=True):
    """
    Represents a system user.

    Roles:
        ADMIN  - Can manage items, rooms, and approve/reject/complete loans.
        BORROWER - Can submit loan requests and view their own loans.
    """

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200, index=True)
    email: str = Field(max_length=200, unique=True, index=True)
    password_hash: str = Field(max_length=512)
    role: UserRole = Field(default=UserRole.BORROWER)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    is_active: bool = Field(default=True)
