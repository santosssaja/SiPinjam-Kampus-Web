from typing import Optional

from sqlmodel import Session, select

from app.models.item import Item


class ItemRepository:
    """
    Data access layer for Item entities.
    All raw DB queries live here; no business logic.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, item_id: int) -> Optional[Item]:
        return self._session.get(Item, item_id)

    def get_by_code(self, code: str) -> Optional[Item]:
        stmt = select(Item).where(Item.code == code)
        return self._session.exec(stmt).first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        active_only: bool = True,
        search: Optional[str] = None,
        category: Optional[str] = None
    ) -> list[Item]:
        stmt = select(Item)
        if active_only:
            stmt = stmt.where(Item.is_active == True)  # noqa: E712
        if search:
            stmt = stmt.where(Item.name.ilike(f"%{search}%"))
        if category:
            stmt = stmt.where(Item.category == category)
            
        stmt = stmt.offset(skip).limit(limit)
        return list(self._session.exec(stmt).all())

    def create(self, item: Item) -> Item:
        self._session.add(item)
        self._session.commit()
        self._session.refresh(item)
        return item

    def update(self, item: Item) -> Item:
        self._session.add(item)
        self._session.commit()
        self._session.refresh(item)
        return item

    def delete(self, item: Item) -> None:
        # Soft delete – preserve history
        item.is_active = False
        self._session.add(item)
        self._session.commit()

    def exists_by_code(self, code: str, exclude_id: Optional[int] = None) -> bool:
        stmt = select(Item).where(Item.code == code)
        if exclude_id is not None:
            stmt = stmt.where(Item.id != exclude_id)
        return self._session.exec(stmt).first() is not None
