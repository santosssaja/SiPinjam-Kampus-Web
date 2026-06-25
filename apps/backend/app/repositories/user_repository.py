from typing import Optional

from sqlmodel import Session, select

from app.models.user import User
from app.models.enums import UserRole


class UserRepository:
    """
    Data access layer for User entities.
    All raw DB queries live here; no business logic.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self._session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self._session.exec(stmt).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        stmt = select(User).offset(skip).limit(limit)
        return list(self._session.exec(stmt).all())

    def create(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user

    def update(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self._session.delete(user)
        self._session.commit()

    def exists_by_email(self, email: str) -> bool:
        stmt = select(User).where(User.email == email)
        return self._session.exec(stmt).first() is not None
