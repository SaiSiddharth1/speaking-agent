from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db
from app.models.session import Session
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(current_user=Depends(get_current_user), db: DBSession = Depends(get_db)):
    base_q = db.query(Session).filter(
        Session.user_id == current_user.id,
        Session.ended_at.isnot(None),
    )
    total_sessions = base_q.count()
    totals = base_q.with_entities(
        func.avg(Session.grammar_score),
        func.avg(Session.fluency_score),
        func.avg(Session.overall_score),
        func.sum(Session.turn_count),
    ).first()

    # last 7 sessions for mini trend
    recent = base_q.order_by(Session.started_at.desc()).limit(7).all()
    trend = [
        {"date": s.started_at.isoformat(), "overall": s.overall_score}
        for s in reversed(recent)
    ]

    return {
        "total_sessions": total_sessions,
        "avg_grammar": round(totals[0] or 0, 1),
        "avg_fluency": round(totals[1] or 0, 1),
        "avg_overall": round(totals[2] or 0, 1),
        "total_turns": int(totals[3] or 0),
        "trend": trend,
    }
