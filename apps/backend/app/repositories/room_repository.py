from typing import Optional

from sqlmodel import Session, select

from app.models.room import Room


class RoomRepository:
    """
    Data access layer for Room entities.
    All raw DB queries live here; no business logic.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, room_id: int) -> Optional[Room]:
        return self._session.get(Room, room_id)

    def get_by_code(self, code: str) -> Optional[Room]:
        stmt = select(Room).where(Room.code == code)
        return self._session.exec(stmt).first()

    def get_all(
        self, skip: int = 0, limit: int = 100, active_only: bool = True
    ) -> list[Room]:
        stmt = select(Room)
        if active_only:
            stmt = stmt.where(Room.is_active == True)  # noqa: E712
        stmt = stmt.offset(skip).limit(limit)
        return list(self._session.exec(stmt).all())

    def create(self, room: Room) -> Room:
        self._session.add(room)
        self._session.commit()
        self._session.refresh(room)
        return room

    def update(self, room: Room) -> Room:
        self._session.add(room)
        self._session.commit()
        self._session.refresh(room)
        return room

    def delete(self, room: Room) -> None:
        # Soft delete – preserve history
        room.is_active = False
        self._session.add(room)
        self._session.commit()

    def exists_by_code(self, code: str, exclude_id: Optional[int] = None) -> bool:
        stmt = select(Room).where(Room.code == code)
        if exclude_id is not None:
            stmt = stmt.where(Room.id != exclude_id)
        return self._session.exec(stmt).first() is not None
