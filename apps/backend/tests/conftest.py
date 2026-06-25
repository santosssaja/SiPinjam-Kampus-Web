"""
Shared test fixtures for SiPinjam Kampus backend tests.
"""
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.models.enums import UserRole
from app.models.user import User
from app.core.security import get_password_hash
from app.repositories.item_repository import ItemRepository
from app.repositories.loan_repository import LoanRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.user_repository import UserRepository
from app.services.borrowing_service import BorrowingService
from app.services.item_service import ItemService
from app.services.room_service import RoomService


@pytest.fixture(name="session")
def session_fixture():
    """In-memory SQLite session for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Import models so they register with SQLModel metadata
    import app.models  # noqa: F401
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture
def user_repo(session: Session) -> UserRepository:
    return UserRepository(session)


@pytest.fixture
def item_repo(session: Session) -> ItemRepository:
    return ItemRepository(session)


@pytest.fixture
def room_repo(session: Session) -> RoomRepository:
    return RoomRepository(session)


@pytest.fixture
def loan_repo(session: Session) -> LoanRepository:
    return LoanRepository(session)


@pytest.fixture
def borrowing_service(
    loan_repo: LoanRepository,
    item_repo: ItemRepository,
    room_repo: RoomRepository,
) -> BorrowingService:
    return BorrowingService(loan_repo, item_repo, room_repo)


@pytest.fixture
def item_service(item_repo: ItemRepository) -> ItemService:
    return ItemService(item_repo)


@pytest.fixture
def room_service(room_repo: RoomRepository) -> RoomService:
    return RoomService(room_repo)


@pytest.fixture
def admin_user(session: Session) -> User:
    user = User(
        name="Admin User",
        email="admin@sipinjam.test",
        password_hash=get_password_hash("adminpass"),
        role=UserRole.ADMIN,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def borrower_user(session: Session) -> User:
    user = User(
        name="Borrower User",
        email="borrower@sipinjam.test",
        password_hash=get_password_hash("borrowerpass"),
        role=UserRole.BORROWER,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
