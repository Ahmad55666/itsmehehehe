from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from config import settings
from utils.token_logic import get_current_user
from models import User
import os
import uuid
import shutil

router = APIRouter()

# Define the directory to store uploaded images
UPLOAD_DIRECTORY = os.path.join("static", "assets", "images", "products")
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Handles image uploads, saves them to the server, and returns the URL.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    # Generate a unique filename to prevent overwrites
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

    try:
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
    finally:
        file.file.close()

    # Construct the URL path to access the file
    file_url = f"/static/assets/images/products/{unique_filename}"
    
    return JSONResponse(content={"file_url": file_url})
