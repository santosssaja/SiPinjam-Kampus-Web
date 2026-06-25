"""
Unit tests for ItemService and RoomService.
"""
import pytest
from fastapi import HTTPException

from app.schemas.item import ItemCreate, ItemUpdate
from app.schemas.room import RoomCreate, RoomUpdate
from app.services.item_service import ItemService
from app.services.room_service import RoomService


class TestItemService:
    def test_create_item_success(self, item_service: ItemService):
        data = ItemCreate(code="IT001", name="Projector", quantity=5)
        item = item_service.create(data)
        assert item.id is not None
        assert item.code == "IT001"
        assert item.quantity == 5

    def test_create_item_duplicate_code_raises(self, item_service: ItemService):
        data = ItemCreate(code="IT001", name="Projector", quantity=2)
        item_service.create(data)

        with pytest.raises(HTTPException) as exc_info:
            item_service.create(ItemCreate(code="IT001", name="Another", quantity=1))
        assert exc_info.value.status_code == 409

    def test_get_item_by_id_success(self, item_service: ItemService):
        created = item_service.create(ItemCreate(code="IT002", name="Microscope", quantity=1))
        found = item_service.get_by_id(created.id)
        assert found.code == "IT002"

    def test_get_item_by_id_not_found(self, item_service: ItemService):
        with pytest.raises(HTTPException) as exc_info:
            item_service.get_by_id(9999)
        assert exc_info.value.status_code == 404

    def test_update_item_success(self, item_service: ItemService):
        created = item_service.create(ItemCreate(code="IT003", name="Camera", quantity=3))
        updated = item_service.update(created.id, ItemUpdate(quantity=10))
        assert updated.quantity == 10

    def test_update_item_duplicate_code_raises(self, item_service: ItemService):
        item_service.create(ItemCreate(code="IT004", name="Tripod", quantity=1))
        item2 = item_service.create(ItemCreate(code="IT005", name="Lens", quantity=2))

        with pytest.raises(HTTPException) as exc_info:
            item_service.update(item2.id, ItemUpdate(code="IT004"))
        assert exc_info.value.status_code == 409

    def test_soft_delete_item(self, item_service: ItemService):
        created = item_service.create(ItemCreate(code="IT006", name="Scanner", quantity=1))
        item_service.delete(created.id)

        with pytest.raises(HTTPException) as exc_info:
            item_service.get_by_id(created.id)
        assert exc_info.value.status_code == 404

    def test_list_items(self, item_service: ItemService):
        item_service.create(ItemCreate(code="IT010", name="A", quantity=1))
        item_service.create(ItemCreate(code="IT011", name="B", quantity=1))
        items = item_service.get_all()
        assert len(items) >= 2


class TestRoomService:
    def test_create_room_success(self, room_service: RoomService):
        data = RoomCreate(code="R101", name="Lab A", capacity=30)
        room = room_service.create(data)
        assert room.id is not None
        assert room.code == "R101"

    def test_create_room_duplicate_code_raises(self, room_service: RoomService):
        room_service.create(RoomCreate(code="R101", name="Lab A", capacity=30))

        with pytest.raises(HTTPException) as exc_info:
            room_service.create(RoomCreate(code="R101", name="Lab B", capacity=20))
        assert exc_info.value.status_code == 409

    def test_get_room_by_id_success(self, room_service: RoomService):
        created = room_service.create(RoomCreate(code="R102", name="Lab B", capacity=25))
        found = room_service.get_by_id(created.id)
        assert found.name == "Lab B"

    def test_get_room_not_found(self, room_service: RoomService):
        with pytest.raises(HTTPException) as exc_info:
            room_service.get_by_id(9999)
        assert exc_info.value.status_code == 404

    def test_update_room_capacity(self, room_service: RoomService):
        created = room_service.create(RoomCreate(code="R103", name="Lab C", capacity=10))
        updated = room_service.update(created.id, RoomUpdate(capacity=50))
        assert updated.capacity == 50

    def test_soft_delete_room(self, room_service: RoomService):
        created = room_service.create(RoomCreate(code="R104", name="Lab D", capacity=15))
        room_service.delete(created.id)

        with pytest.raises(HTTPException) as exc_info:
            room_service.get_by_id(created.id)
        assert exc_info.value.status_code == 404
