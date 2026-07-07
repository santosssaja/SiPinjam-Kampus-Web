from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------


class ItemCreate(BaseModel):
    """Schema for creating a new item."""

    code: str
    name: str
    quantity: int
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

    @field_validator("code", "name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty")
        return v


class ItemUpdate(BaseModel):
    """Schema for updating an existing item (all fields optional)."""

    code: Optional[str] = None
    name: Optional[str] = None
    quantity: Optional[int] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------


class ItemResponse(BaseModel):
    """Public item representation."""

    id: int
    code: str
    name: str
    quantity: int
    description: Optional[str]
    category: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
