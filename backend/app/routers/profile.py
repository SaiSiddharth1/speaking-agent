from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db
from app.models.session import Session
from app.models.user import User
from app.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/profile", tags=["profile"])

def _compute_level(overall_avg: float) -> str:
    if overall_avg >= 85:
        return "Advanced"
    elif overall_avg >= 65:
        return "Intermediate"
    else:
        return "Beginner"

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user), db: DBSession = Depends(get_db)):
    stats = db.query(
        func.count(Session.id),
        func.avg(Session.overall_score),
    ).filter(Session.user_id == current_user.id, Session.ended_at.isnot(None)).first()

    total = stats[0] or 0
    avg_overall = round(stats[1] or 0, 1)
    level = _compute_level(avg_overall)

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "level": level,
        "total_sessions": total,
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
    current_user.full_name = payload.name
    db.commit()
    return {"message": "Profile updated"}
