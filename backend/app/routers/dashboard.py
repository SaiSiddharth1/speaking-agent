from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db
from app.models.session import ConversationSession, Message
from app.models.score import Score
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(current_user=Depends(get_current_user), db: DBSession = Depends(get_db)):
    # Calculate totals from Score
    totals = db.query(
        func.avg(Score.grammar_score),
        func.avg(Score.fluency_score),
        func.avg(Score.overall_score),
    ).filter(Score.user_id == current_user.id).first()

    # Calculate total turns from Message count via Join
    total_turns = db.query(func.count(Message.id)).join(ConversationSession).filter(
        ConversationSession.user_id == current_user.id
    ).scalar() or 0

    # Calculate total sessions
    total_sessions = db.query(ConversationSession).filter(
        ConversationSession.user_id == current_user.id
    ).count()

    # last 7 sessions for mini trend
    recent = db.query(Score).filter(Score.user_id == current_user.id).order_by(Score.created_at.desc()).limit(7).all()
    trend = [
        {"date": s.created_at.isoformat(), "overall": s.overall_score}
        for s in reversed(recent)
    ]

    return {
        "total_sessions": total_sessions,
        "avg_grammar": round(totals[0] or 0, 1),
        "avg_fluency": round(totals[1] or 0, 1),
        "avg_overall": round(totals[2] or 0, 1),
        "total_turns": int(total_turns),
        "trend": trend,
    }
