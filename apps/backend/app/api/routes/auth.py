from typing import Annotated

from fastapi import APIRouter, Depends, Request
from app.core.rate_limit import limiter

from app.api.deps import CurrentUser, get_auth_service
from app.schemas.user import TokenResponse, UserRegister, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("100/minute")
def register(
    request: Request,
    data: UserRegister,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    """Register a new user account."""
    user = auth_service.register(data)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("100/minute")
def login(
    request: Request,
    data: UserLogin,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    """Authenticate and receive a JWT access token."""
    return auth_service.login(data)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser):
    """Return the currently authenticated user's profile."""
    return current_user
