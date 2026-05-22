from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.stt_service import transcribe_audio
import asyncio

router = APIRouter(prefix="/api/speech", tags=["speech"])

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Validate file type
    allowed = ["audio/wav", "audio/mpeg", "audio/m4a", "audio/x-m4a",
               "audio/webm", "application/octet-stream"]
    
    if file.content_type not in allowed:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    file_bytes = await file.read()
    
    if len(file_bytes) == 0:
        raise HTTPException(400, "Empty audio file")

    transcript = await transcribe_audio(file_bytes, "audio.wav")

    return { "transcript": transcript, "word_count": len(transcript.split()) }
