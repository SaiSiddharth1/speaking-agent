from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.score import Score
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/progress", tags=["Progress"])

class ScoreCreate(BaseModel):
    session_id: int
    grammar_score: float
    fluency_score: float
    vocabulary_score: float
    overall_score: float

class ScoreOut(ScoreCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

@router.post("/scores", response_model=ScoreOut)
def save_score(
    data: ScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    score = Score(user_id=current_user.id, **data.dict())
    db.add(score)
    db.commit()
    db.refresh(score)
    return score

@router.get("/scores", response_model=List[ScoreOut])
def get_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Score)\
             .filter(Score.user_id == current_user.id)\
             .order_by(Score.created_at.desc())\
             .limit(20).all()

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.query(
        func.avg(Score.grammar_score).label("avg_grammar"),
        func.avg(Score.fluency_score).label("avg_fluency"),
        func.avg(Score.vocabulary_score).label("avg_vocabulary"),
        func.avg(Score.overall_score).label("avg_overall"),
        func.count(Score.id).label("total_sessions")
    ).filter(Score.user_id == current_user.id).first()

    return {
        "avg_grammar": round(result.avg_grammar or 0, 1),
        "avg_fluency": round(result.avg_fluency or 0, 1),
        "avg_vocabulary": round(result.avg_vocabulary or 0, 1),
        "avg_overall": round(result.avg_overall or 0, 1),
        "total_sessions": result.total_sessions or 0
    }
