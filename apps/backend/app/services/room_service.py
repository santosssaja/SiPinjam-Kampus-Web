from fastapi import HTTPException, status

from app.models.room import Room
from app.repositories.room_repository import RoomRepository
from app.schemas.room import RoomCreate, RoomUpdate


class RoomService:
    """
    Business logic for Room management.
    Enforces uniqueness and soft-delete semantics.
    """

    def __init__(self, room_repo: RoomRepository) -> None:
        self._repo = room_repo

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Room]:
        return self._repo.get_all(skip=skip, limit=limit)

    def get_by_id(self, room_id: int) -> Room:
        room = self._repo.get_by_id(room_id)
        if not room or not room.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Room with ID {room_id} not found",
            )
        return room

    def create(self, data: RoomCreate) -> Room:
        """
        Create a new room.

        Raises:
            HTTPException 409 if room code already exists.
        """
        if self._repo.exists_by_code(data.code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Room code '{data.code}' already exists",
            )
        room = Room(**data.model_dump())
        return self._repo.create(room)

    def update(self, room_id: int, data: RoomUpdate) -> Room:
        """
        Update an existing room.

        Raises:
            HTTPException 404 if not found.
            HTTPException 409 if the new code conflicts.
        """
        room = self.get_by_id(room_id)

        update_data = data.model_dump(exclude_unset=True)

        if "code" in update_data and update_data["code"] != room.code:
            if self._repo.exists_by_code(update_data["code"], exclude_id=room_id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Room code '{update_data['code']}' already exists",
                )

        for field, value in update_data.items():
            setattr(room, field, value)

        return self._repo.update(room)

    def delete(self, room_id: int) -> None:
        """Soft-delete a room."""
        room = self.get_by_id(room_id)
        self._repo.delete(room)
