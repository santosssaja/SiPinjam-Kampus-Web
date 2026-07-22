from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentAdmin, CurrentUser, SessionDep
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    session: SessionDep = None,  # type: ignore[assignment]
    current_user: CurrentUser = None,  # type: ignore[assignment]
):
    """List all item categories."""
    categories = session.exec(select(Category)).all()
    return categories


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    session: SessionDep = None,  # type: ignore[assignment]
    current_admin: CurrentAdmin = None,  # type: ignore[assignment]
):
    """Create a new category. Admin only."""
    existing = session.exec(select(Category).where(Category.name == data.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category '{data.name}' already exists",
        )
    
    category = Category(name=data.name)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category
