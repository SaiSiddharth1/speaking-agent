from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.session import ConversationSession, Message
from app.models.user import User
from app.schemas.session import SessionCreate, SessionOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.post("/", response_model=SessionOut)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ConversationSession(user_id=current_user.id, topic=data.topic)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/", response_model=List[SessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ConversationSession)\
             .filter(ConversationSession.user_id == current_user.id)\
             .order_by(ConversationSession.created_at.desc())\
             .all()

@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ConversationSession).filter(
        ConversationSession.id == session_id,
        ConversationSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/{session_id}/messages")
def save_message(
    session_id: int,
    role: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure session exists and belongs to current user
    session = db.query(ConversationSession).filter(
        ConversationSession.id == session_id,
        ConversationSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msg = Message(session_id=session_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
