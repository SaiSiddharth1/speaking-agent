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
        
        # ARCHITECTURAL DECISION: Chaining STT -> LLM Pipeline
        # We choose NOT to chain the STT output directly into the LLM conversation endpoint here.
        # Instead, the frontend should make 2 separate API calls:
        # 1. POST /api/stt/transcribe (returns transcript instantly)
        # 2. POST /api/conversation/message (sends transcript to get AI response)
        # Tradeoffs:
        # - User Experience: Keeping them separate allows the frontend to show the user their transcribed text immediately (lower perceived latency) while showing a loading state for the AI response. If chained here, the user would have to wait much longer in silence.
        # - Error Handling: If the LLM fails, the transcript is still preserved on the client side.
        
        return {"transcript": text}
    
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    finally:
        # Always clean up the temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
