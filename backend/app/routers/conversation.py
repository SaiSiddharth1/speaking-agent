import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.llm_service import get_coach_response
from app.database import get_db
from app.models.conversation import ConversationSession, ConversationMessage
from app.schemas.conversation import MessageRequest, CoachResponse, SessionStartRequest, SessionResponse
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversation", tags=["conversation"])

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
    # 1. Load conversation history from DB for this session
    session = db.query(ConversationSession).filter(ConversationSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(ConversationMessage).filter(ConversationMessage.session_id == payload.session_id).order_by(ConversationMessage.created_at).all()
    
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in messages]
    
    topic = session.topic or "daily life"
    
    # 2. Call get_coach_response()
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

    # 3. Save user message to DB
    user_msg = ConversationMessage(
        session_id=payload.session_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    
    # 4. Save assistant response to DB
    ai_msg = ConversationMessage(
        session_id=payload.session_id,
        role="assistant",
        content=result.get("response", ""),
        scores=result.get("score")
    )
    db.add(ai_msg)
    
    # Optional: Update average score in session
    score = result.get("score")
    if score and isinstance(score, dict):
        avg = sum(filter(None, score.values())) / len([v for v in score.values() if v is not None]) if any(score.values()) else None
        if avg:
            session.avg_score = avg # simplified updating
            
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving messages to DB: {e}")
        raise HTTPException(status_code=500, detail="Could not save conversation messages")

    # 5. Return the coach response
    return CoachResponse(
        correction=result.get("correction"),
        praise=result.get("praise"),
        response=result.get("response"),
        follow_up=result.get("follow_up"),
        score=result.get("score")
    )
