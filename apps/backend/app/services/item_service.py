from fastapi import HTTPException, status

from app.models.item import Item
from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    """
    Business logic for Item management.
    Enforces uniqueness and soft-delete semantics.
    """

    def __init__(self, item_repo: ItemRepository) -> None:
        self._repo = item_repo

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Item]:
        return self._repo.get_all(skip=skip, limit=limit)

    def get_by_id(self, item_id: int) -> Item:
        item = self._repo.get_by_id(item_id)
        if not item or not item.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found",
            )
        return item

    def create(self, data: ItemCreate) -> Item:
        """
        Create a new item.

        Raises:
            HTTPException 409 if item code already exists.
        """
        if self._repo.exists_by_code(data.code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Item code '{data.code}' already exists",
            )
        item = Item(**data.model_dump())
        return self._repo.create(item)

    def update(self, item_id: int, data: ItemUpdate) -> Item:
        """
        Update an existing item.

        Raises:
            HTTPException 404 if not found.
            HTTPException 409 if the new code conflicts.
        """
        item = self.get_by_id(item_id)

        update_data = data.model_dump(exclude_unset=True)

        if "code" in update_data and update_data["code"] != item.code:
            if self._repo.exists_by_code(update_data["code"], exclude_id=item_id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Item code '{update_data['code']}' already exists",
                )

        for field, value in update_data.items():
            setattr(item, field, value)

        return self._repo.update(item)

    def delete(self, item_id: int) -> None:
        """Soft-delete an item."""
        item = self.get_by_id(item_id)
        self._repo.delete(item)
