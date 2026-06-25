from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.enums import UserRole


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------


class UserRegister(BaseModel):
    """Schema for new user registration."""

    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.BORROWER

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class UserLogin(BaseModel):
    """Schema for user login credentials."""

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    name: Optional[str] = None
    email: Optional[EmailStr] = None


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------


class UserResponse(BaseModel):
    """Public user representation (no password)."""

    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
