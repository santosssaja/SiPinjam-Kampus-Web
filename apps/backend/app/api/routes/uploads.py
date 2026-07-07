import io
from PIL import Image as PILImage
from sqlmodel import Session
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import Response

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.models.image import Image

router = APIRouter()

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Hanya file gambar yang diperbolehkan.")
    
    # Read image
    content = await file.read()
    
    # Compress image
    try:
        img = PILImage.open(io.BytesIO(content))
        # Convert to RGB if necessary (e.g. RGBA for PNG)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # Resize if too large (e.g. max 1024x1024)
        img.thumbnail((1024, 1024))
        
        # Save compressed to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=85)
        compressed_content = img_byte_arr.getvalue()
        content_type = "image/jpeg"
    except Exception as e:
        # Fallback to original if compression fails
        compressed_content = content
        content_type = file.content_type

    # Save to database
    db_image = Image(data=compressed_content, content_type=content_type)
    session.add(db_image)
    session.commit()
    session.refresh(db_image)
    
    return {"url": f"/api/v1/uploads/image/{db_image.id}"}

@router.get("/image/{image_id}")
def get_image(image_id: int, session: Session = Depends(get_session)):
    db_image = session.get(Image, image_id)
    if not db_image:
        raise HTTPException(status_code=404, detail="Gambar tidak ditemukan")
    return Response(content=db_image.data, media_type=db_image.content_type)
