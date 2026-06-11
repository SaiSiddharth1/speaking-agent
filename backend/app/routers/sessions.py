from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.session import Session as SessionModel
from app.schemas.session import SessionOut
from app.auth_utils import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.get("/", response_model=List[SessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SessionModel)
        .filter(SessionModel.user_id == current_user.id)
        .order_by(SessionModel.created_at.desc())
        .limit(50)
        .all()
    )

@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id, SessionModel.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
