from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.session import SessionCreate, SessionOut
from app.services.session_service import save_session, get_user_sessions
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.post("/", response_model=SessionOut)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return save_session(db, current_user.id, data)

@router.get("/", response_model=List[SessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_sessions(db, current_user.id)
