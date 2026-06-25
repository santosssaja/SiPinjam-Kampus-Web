from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, field_validator

from app.models.enums import LoanStatus, ResourceType
from app.schemas.user import UserResponse


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------


class LoanCreate(BaseModel):
    """Schema for creating a new loan/reservation request."""

    resource_type: ResourceType
    resource_id: int
    date: date
    start_time: time
    end_time: time
    purpose: str

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, end_time: time, info) -> time:
        start_time = info.data.get("start_time")
        if start_time and end_time <= start_time:
            raise ValueError("end_time must be after start_time")
        return end_time

    @field_validator("purpose")
    @classmethod
    def purpose_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Purpose cannot be empty")
        return v


# ---------------------------------------------------------------------------
# Availability Check
# ---------------------------------------------------------------------------


class AvailabilityQuery(BaseModel):
    """Schema for checking resource availability."""

    resource_type: ResourceType
    resource_id: int
    date: date
    start_time: time
    end_time: time


class AvailabilityResponse(BaseModel):
    """Response for availability check."""

    available: bool
    conflicts: int
    message: str


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------


class LoanResponse(BaseModel):
    """Loan representation with nested borrower info."""

    id: int
    borrower_id: int
    resource_type: ResourceType
    resource_id: int
    date: date
    start_time: time
    end_time: time
    purpose: str
    status: LoanStatus
    approved_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class LoanDetailResponse(LoanResponse):
    """Extended loan response with borrower details."""

    borrower: Optional[UserResponse] = None

    model_config = {"from_attributes": True}
