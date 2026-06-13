from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.services.progress_service import get_progress_summary, get_score_history
from app.models.user import User

router = APIRouter(prefix="/api/progress", tags=["Progress"])

@router.get("/summary")
def progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_progress_summary(db, current_user.id)

@router.get("/history")
def score_history(
    days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_score_history(db, current_user.id, days)
