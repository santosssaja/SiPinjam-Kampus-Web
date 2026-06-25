from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import CurrentAdmin, CurrentUser, get_room_service
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate
from app.services.room_service import RoomService

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", response_model=list[RoomResponse])
def list_rooms(
    skip: int = 0,
    limit: int = 100,
    room_service: Annotated[RoomService, Depends(get_room_service)] = None,
    current_user: CurrentUser = None,
):
    """List all active rooms. Accessible by any authenticated user."""
    return room_service.get_all(skip=skip, limit=limit)


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: int,
    room_service: Annotated[RoomService, Depends(get_room_service)] = None,
    current_user: CurrentUser = None,
):
    """Get a single room by ID."""
    return room_service.get_by_id(room_id)


@router.post("", response_model=RoomResponse, status_code=201)
def create_room(
    data: RoomCreate,
    room_service: Annotated[RoomService, Depends(get_room_service)] = None,
    current_admin: CurrentAdmin = None,
):
    """Create a new room. Admin only."""
    return room_service.create(data)


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    data: RoomUpdate,
    room_service: Annotated[RoomService, Depends(get_room_service)] = None,
    current_admin: CurrentAdmin = None,
):
    """Update an existing room. Admin only."""
    return room_service.update(room_id, data)


@router.delete("/{room_id}", status_code=204)
def delete_room(
    room_id: int,
    room_service: Annotated[RoomService, Depends(get_room_service)] = None,
    current_admin: CurrentAdmin = None,
):
    """Soft-delete a room. Admin only."""
    room_service.delete(room_id)
