from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.stt_service import transcribe_audio

router = APIRouter(prefix="/transcribe", tags=["STT"])

@router.post("/")
async def transcribe(audio: UploadFile = File(...)):
    if not audio.filename.endswith((".m4a", ".wav", ".mp3", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported audio format")
    
    file_bytes = await audio.read()
    
    try:
        transcript = await transcribe_audio(file_bytes, audio.filename)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
