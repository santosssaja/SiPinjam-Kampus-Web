from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------


class RoomCreate(BaseModel):
    """Schema for creating a new room."""

    code: str
    name: str
    capacity: int
    description: Optional[str] = None

    @field_validator("capacity")
    @classmethod
    def capacity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Room capacity must be at least 1")
        return v

    @field_validator("code", "name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty")
        return v


class RoomUpdate(BaseModel):
    """Schema for updating an existing room (all fields optional)."""

    code: Optional[str] = None
    name: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("capacity")
    @classmethod
    def capacity_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("Room capacity must be at least 1")
        return v


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------


class RoomResponse(BaseModel):
    """Public room representation."""

    id: int
    code: str
    name: str
    capacity: int
    description: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
