from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.whisper_service import transcribe_audio
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

    # Run in executor — Whisper is CPU-bound, don't block async loop
    loop = asyncio.get_event_loop()
    transcript = await loop.run_in_executor(
        None, transcribe_audio, file_bytes, "wav"
    )

    return { "transcript": transcript, "word_count": len(transcript.split()) }
