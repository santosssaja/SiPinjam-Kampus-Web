from typing import Optional

from fastapi import HTTPException, status

from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse


class AuthService:
    """
    Handles authentication business logic.
    - Registration with duplicate email detection
    - Login with credential verification and token issuance
    """

    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    def register(self, data: UserRegister) -> User:
        """
        Register a new user.

        Raises:
            HTTPException 400 if email already exists.
        """
        if self._user_repo.exists_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user = User(
            name=data.name,
            email=data.email,
            password_hash=get_password_hash(data.password),
            role=data.role,
        )
        return self._user_repo.create(user)

    def login(self, data: UserLogin) -> TokenResponse:
        """
        Authenticate a user and return a JWT token.

        Raises:
            HTTPException 401 if credentials are invalid.
        """
        user = self._user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        token = create_access_token(subject=str(user.id))
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    def get_user_by_id(self, user_id: int) -> User:
        """
        Retrieve a user by ID.

        Raises:
            HTTPException 404 if not found.
        """
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user
