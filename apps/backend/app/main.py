"""
SiPinjam Kampus — FastAPI Application Entry Point.

Architecture:
  - Service Layer Pattern: business logic lives exclusively in services/
  - Repository Pattern: all DB access is in repositories/
  - SOLID principles applied throughout
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: run startup/shutdown tasks."""
    # Startup
    init_db()
    yield
    # Shutdown (add cleanup here if needed)


def create_app() -> FastAPI:
    """Application factory."""
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Campus borrowing management system for laboratory equipment "
            "and room reservations."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    application.include_router(api_router)

    @application.get("/health", tags=["Health"])
    def health_check():
        return {
            "status": "ok",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }

    return application


app = create_app()
