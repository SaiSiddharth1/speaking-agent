import io
import json
import logging
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.conversation import ConversationSession, ConversationMessage
from app.schemas.conversation import MessageRequest, CoachResponse, SessionStartRequest, SessionResponse
from app.services.stt_service import transcribe_audio
from app.services.groq_service import get_ai_response
from app.services.tts_service import text_to_speech
from app.services.llm_service import get_coach_response

logger = logging.getLogger(__name__)

# Router prefix will be set to /api/conversation in main.py
router = APIRouter(tags=["conversation"])

@router.post("/respond")
async def respond(
    file: UploadFile = File(None),
    audio: UploadFile = File(None),
    history: str = Form("[]")
):
    """
    Main conversation pipeline endpoint:
    User Audio -> STT (Whisper) -> LLM (Groq Llama3) -> TTS (Edge-TTS) -> Streaming Audio Response.
    
    Also returns the transcription and reply text in HTTP headers:
    - X-Transcript (URL-encoded)
    - X-Reply-Text (URL-encoded)
    """
    try:
        uploaded_file = file or audio
        if not uploaded_file:
            raise HTTPException(status_code=400, detail="No audio file uploaded.")
            
        contents = await uploaded_file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file.")
            
        # 1. STT — transcribe
        transcript = await transcribe_audio(contents, uploaded_file.filename or "audio.m4a")
        
        if not transcript or not transcript.strip():
            transcript = "[Unclear audio]"
            reply_text = "I couldn't hear you clearly. Could you repeat that, please?"
        else:
            # 2. LLM — get AI response
            try:
                history_list = json.loads(history)
            except Exception:
                history_list = []
                
            reply_text = await get_ai_response(transcript, history_list)
            
        # 3. TTS — convert reply text to audio bytes
        audio_bytes = await text_to_speech(reply_text)
        
        # 4. Return audio stream with helper headers
        headers = {
            "Access-Control-Expose-Headers": "X-Transcript, X-Reply-Text",
            "X-Transcript": urllib.parse.quote(transcript),
            "X-Reply-Text": urllib.parse.quote(reply_text)
        }
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Error in conversation respond pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def conversation(audio: UploadFile = File(...)):
    """
    Deprecated/Legacy endpoint: transcribe audio and get text response.
    """
    try:
        contents = await audio.read()
        transcript = await transcribe_audio(contents, audio.filename or "audio.m4a")
        ai_reply = await get_ai_response(transcript, [])
        return {
            "transcript": transcript,
            "ai_reply": ai_reply
        }
    except Exception as e:
        logger.error(f"Error in legacy conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/session/start", response_model=SessionResponse)
async def start_session(request: SessionStartRequest, db: Session = Depends(get_db)):
    try:
        new_session = ConversationSession(
            user_id=request.user_id,
            topic=request.topic
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return SessionResponse(
            session_id=new_session.id,
            topic=new_session.topic or "daily life"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Could not create conversation session")

@router.post("/message", response_model=CoachResponse)
async def send_message(payload: MessageRequest, db: Session = Depends(get_db)):
    session = db.query(ConversationSession).filter(ConversationSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(ConversationMessage).filter(ConversationMessage.session_id == payload.session_id).order_by(ConversationMessage.created_at).all()
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in messages]
    topic = session.topic or "daily life"
    
    try:
        result = await get_coach_response(
            user_message=payload.message,
            conversation_history=history_dicts,
            user_level=payload.level,
            topic=topic
        )
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise HTTPException(status_code=503, detail=f"Groq API service unavailable: {str(e)}")

    user_msg = ConversationMessage(
        session_id=payload.session_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    
    ai_msg = ConversationMessage(
        session_id=payload.session_id,
        role="assistant",
        content=result.get("response", ""),
        scores=result.get("score")
    )
    db.add(ai_msg)
    
    score = result.get("score")
    if score and isinstance(score, dict):
        avg = sum(filter(None, score.values())) / len([v for v in score.values() if v is not None]) if any(score.values()) else None
        if avg:
            session.avg_score = avg
            
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving messages to DB: {e}")
        raise HTTPException(status_code=500, detail="Could not save conversation messages")

    return CoachResponse(
        correction=result.get("correction"),
        praise=result.get("praise"),
        response=result.get("response"),
        follow_up=result.get("follow_up"),
        score=result.get("score")
    )
