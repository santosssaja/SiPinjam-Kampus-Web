from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import CurrentAdmin, CurrentUser, get_item_service
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services.item_service import ItemService

router = APIRouter(prefix="/items", tags=["Items"])

ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]


@router.get("", response_model=list[ItemResponse])
def list_items(
    skip: int = 0,
    limit: int = 100,
    item_service: ItemServiceDep = None,  # type: ignore[assignment]
    current_user: CurrentUser = None,  # type: ignore[assignment]
):
    """List all active items. Accessible by any authenticated user."""
    return item_service.get_all(skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int,
    item_service: ItemServiceDep = None,  # type: ignore[assignment]
    current_user: CurrentUser = None,  # type: ignore[assignment]
):
    """Get a single item by ID."""
    return item_service.get_by_id(item_id)


@router.post("", response_model=ItemResponse, status_code=201)
def create_item(
    data: ItemCreate,
    item_service: ItemServiceDep = None,  # type: ignore[assignment]
    current_admin: CurrentAdmin = None,  # type: ignore[assignment]
):
    """Create a new item. Admin only."""
    return item_service.create(data)


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    data: ItemUpdate,
    item_service: ItemServiceDep = None,  # type: ignore[assignment]
    current_admin: CurrentAdmin = None,  # type: ignore[assignment]
):
    """Update an existing item. Admin only."""
    return item_service.update(item_id, data)


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: int,
    item_service: ItemServiceDep = None,  # type: ignore[assignment]
    current_admin: CurrentAdmin = None,  # type: ignore[assignment]
):
    """Soft-delete an item. Admin only."""
    item_service.delete(item_id)
