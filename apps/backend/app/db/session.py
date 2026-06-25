from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine creation
# ---------------------------------------------------------------------------
# SQLite for development, LibSQL/Turso for production.
# The DATABASE_URL is read from the environment / .env file via Settings.
# ---------------------------------------------------------------------------

_connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # Required for SQLite to work safely with FastAPI's async environment
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.is_development,  # SQL logging in dev only
    connect_args=_connect_args,
)


def init_db() -> None:
    """
    Create all database tables.
    Called once on application startup.
    In production use Alembic migrations instead.
    """
    # Import all models so SQLModel can discover them
    import app.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    """
    FastAPI dependency that yields a database session.

    Usage:
        @router.get("/")
        def handler(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
