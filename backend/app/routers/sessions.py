from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models.session import Session
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

class SessionCreate(BaseModel):
    pass  # just creates an empty session, user_id from token

class SessionEnd(BaseModel):
    grammar_score: float
    fluency_score: float
    overall_score: float
    turn_count: int

class SessionOut(BaseModel):
    id: int
    started_at: datetime
    ended_at: Optional[datetime]
    grammar_score: Optional[float]
    fluency_score: Optional[float]
    overall_score: Optional[float]
    turn_count: int

    class Config:
        from_attributes = True

@router.post("/start", response_model=SessionOut)
def start_session(current_user=Depends(get_current_user), db: DBSession = Depends(get_db)):
    session = Session(user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.put("/{session_id}/end", response_model=SessionOut)
def end_session(
    session_id: int,
    payload: SessionEnd,
    current_user=Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    session = db.query(Session).filter(
        Session.id == session_id, Session.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.ended_at = datetime.utcnow()
    session.grammar_score = payload.grammar_score
    session.fluency_score = payload.fluency_score
    session.overall_score = payload.overall_score
    session.turn_count = payload.turn_count
    db.commit()
    db.refresh(session)
    return session

@router.get("/", response_model=List[SessionOut])
def list_sessions(
    current_user=Depends(get_current_user),
    db: DBSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0,
):
    sessions = (
        db.query(Session)
        .filter(Session.user_id == current_user.id, Session.ended_at.isnot(None))
        .order_by(Session.started_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return sessions
