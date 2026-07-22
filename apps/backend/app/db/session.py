from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine creation
# ---------------------------------------------------------------------------
# SQLite for development, LibSQL/Turso for production.
# The DATABASE_URL is read from the environment / .env file via Settings.
# ---------------------------------------------------------------------------

_connect_args = {}
_db_url = settings.DATABASE_URL

if _db_url.startswith("sqlite+libsql://"):
    # Turso/LibSQL: pass auth token via connect_args to avoid URL encoding issues
    if settings.TURSO_AUTH_TOKEN:
        _connect_args = {"auth_token": settings.TURSO_AUTH_TOKEN}
    # Strip authToken from URL if present (it's now in connect_args)
    if "authToken=" in _db_url:
        from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
        parsed = urlparse(_db_url)
        qs = {k: v for k, v in parse_qs(parsed.query).items() if k != "authToken"}
        _db_url = urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))
elif _db_url.startswith("sqlite:///") or _db_url == "sqlite://":
    # Local SQLite - check_same_thread required
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    _db_url,
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
