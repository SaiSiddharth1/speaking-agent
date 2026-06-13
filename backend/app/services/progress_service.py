from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.session import ConversationSession

def get_progress_summary(db: Session, user_id: int) -> dict:
    sessions = (
        db.query(ConversationSession)
        .filter(ConversationSession.user_id == user_id)
        .all()
    )
    if not sessions:
        return {
            "total_sessions": 0,
            "total_minutes": 0,
            "avg_grammar": 0,
            "avg_fluency": 0,
            "avg_overall": 0,
            "best_score": 0,
            "streak_days": 0,
        }

    total_seconds = sum(s.duration_seconds for s in sessions)
    avg_grammar = sum(s.grammar_score for s in sessions) / len(sessions)
    avg_fluency = sum(s.fluency_score for s in sessions) / len(sessions)
    avg_overall = sum(s.overall_score for s in sessions) / len(sessions)
    best_score = max(s.overall_score for s in sessions)

    # Calculate streak (consecutive days with at least 1 session)
    from datetime import date, timedelta
    session_dates = sorted(
        set(s.created_at.date() for s in sessions), reverse=True
    )
    streak = 0
    today = date.today()
    for i, d in enumerate(session_dates):
        if d == today - timedelta(days=i):
            streak += 1
        else:
            break

    return {
        "total_sessions": len(sessions),
        "total_minutes": round(total_seconds / 60),
        "avg_grammar": round(avg_grammar, 1),
        "avg_fluency": round(avg_fluency, 1),
        "avg_overall": round(avg_overall, 1),
        "best_score": round(best_score, 1),
        "streak_days": streak,
    }

def get_score_history(db: Session, user_id: int, days: int = 30):
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(days=days)
    sessions = (
        db.query(ConversationSession)
        .filter(
            ConversationSession.user_id == user_id,
            ConversationSession.created_at >= cutoff
        )
        .order_by(ConversationSession.created_at.asc())
        .all()
    )
    return [
        {
            "date": s.created_at.strftime("%Y-%m-%d"),
            "grammar": s.grammar_score,
            "fluency": s.fluency_score,
            "overall": s.overall_score,
        }
        for s in sessions
    ]
