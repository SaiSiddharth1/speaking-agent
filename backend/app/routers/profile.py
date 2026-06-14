from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db
from app.models.score import Score
from app.models.session import ConversationSession
from app.models.user import User
from app.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/profile", tags=["profile"])

def _compute_level(overall_avg: float) -> str:
    if overall_avg >= 8.5:
        return "Advanced"
    elif overall_avg >= 6.5:
        return "Intermediate"
    else:
        return "Beginner"

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user), db: DBSession = Depends(get_db)):
    stats = db.query(
        func.avg(Score.overall_score),
    ).filter(Score.user_id == current_user.id).first()

    total_sessions = db.query(ConversationSession).filter(
        ConversationSession.user_id == current_user.id
    ).count()

    avg_overall = round(stats[0] or 0, 1) if stats else 0.0
    level = _compute_level(avg_overall)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "level": level,
        "total_sessions": total_sessions,
        "avg_overall": avg_overall,
    }

class UpdateProfile(BaseModel):
    name: str

@router.put("/me")
def update_profile(
    payload: UpdateProfile,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    current_user.name = payload.name
    db.commit()
    return {"message": "Profile updated"}
