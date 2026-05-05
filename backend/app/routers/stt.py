from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from app.services.whisper_service import transcribe

router = APIRouter(prefix="/api/stt", tags=["STT"])

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Generate a unique temp filename to avoid collisions
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_path = temp_filename
    
    try:
        # Save the uploaded file temporarily
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Perform transcription
        text = transcribe(temp_path)
        return {"transcript": text}
    
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    finally:
        # Always clean up the temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
