from fastapi import APIRouter

from app.api.routes import auth, items, loans, rooms, uploads, categories

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(items.router)
api_router.include_router(rooms.router)
api_router.include_router(loans.router)
api_router.include_router(categories.router)
api_router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
