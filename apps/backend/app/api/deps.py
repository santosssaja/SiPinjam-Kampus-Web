"""
FastAPI dependency injection container.

All services and repositories are wired here.
Routes import these dependencies to avoid constructor coupling.
"""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.item_repository import ItemRepository
from app.repositories.loan_repository import LoanRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.borrowing_service import BorrowingService
from app.services.item_service import ItemService
from app.services.room_service import RoomService

# ---------------------------------------------------------------------------
# HTTP Bearer scheme
# ---------------------------------------------------------------------------
bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[Session, Depends(get_session)]
BearerDep = Annotated[
    Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)
]


# ---------------------------------------------------------------------------
# Repository factories
# ---------------------------------------------------------------------------


def get_user_repo(session: SessionDep) -> UserRepository:
    return UserRepository(session)


def get_item_repo(session: SessionDep) -> ItemRepository:
    return ItemRepository(session)


def get_room_repo(session: SessionDep) -> RoomRepository:
    return RoomRepository(session)


def get_loan_repo(session: SessionDep) -> LoanRepository:
    return LoanRepository(session)


# ---------------------------------------------------------------------------
# Service factories
# ---------------------------------------------------------------------------


def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
) -> AuthService:
    return AuthService(user_repo)


def get_item_service(
    item_repo: Annotated[ItemRepository, Depends(get_item_repo)],
) -> ItemService:
    return ItemService(item_repo)


def get_room_service(
    room_repo: Annotated[RoomRepository, Depends(get_room_repo)],
) -> RoomService:
    return RoomService(room_repo)


def get_borrowing_service(
    loan_repo: Annotated[LoanRepository, Depends(get_loan_repo)],
    item_repo: Annotated[ItemRepository, Depends(get_item_repo)],
    room_repo: Annotated[RoomRepository, Depends(get_room_repo)],
) -> BorrowingService:
    return BorrowingService(loan_repo, item_repo, room_repo)


# ---------------------------------------------------------------------------
# Authentication dependencies
# ---------------------------------------------------------------------------


def get_current_user(
    credentials: BearerDep,
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
) -> User:
    """Extract and validate the JWT token; return the authenticated User."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = decode_access_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = user_repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )
    return user


def get_current_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure the current user has ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAdmin = Annotated[User, Depends(get_current_admin)]
