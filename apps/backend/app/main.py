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
from fastapi.responses import HTMLResponse

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
        redoc_url=None,          # disable default redoc (uses broken @next CDN)
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

    @application.get("/redoc", include_in_schema=False, response_class=HTMLResponse)
    def redoc_html():
        """Custom ReDoc UI using a pinned, working CDN version."""
        return HTMLResponse(f"""<!DOCTYPE html>
<html>
  <head>
    <title>{settings.APP_NAME} — API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body {{ margin: 0; padding: 0; }}</style>
  </head>
  <body>
    <redoc spec-url="/openapi.json"></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.2.0/bundles/redoc.standalone.js"></script>
  </body>
</html>""")

    return application


app = create_app()
