from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.session import Session as SessionModel
from app.schemas.session import ProgressOut
from app.auth_utils import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("/", response_model=ProgressOut)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    day7 = now - timedelta(days=7)
    day30 = now - timedelta(days=30)

    def avg_scores(since: datetime):
        result = (
            db.query(
                func.avg(SessionModel.grammar_score),
                func.avg(SessionModel.fluency_score),
                func.avg(SessionModel.overall_score),
            )
            .filter(
                SessionModel.user_id == current_user.id,
                SessionModel.created_at >= since,
            )
            .first()
        )
        return [round(float(v or 0), 2) for v in result]

    g7, f7, o7 = avg_scores(day7)
    g30, f30, o30 = avg_scores(day30)

    total = db.query(func.count(SessionModel.id)).filter(
        SessionModel.user_id == current_user.id
    ).scalar() or 0

    # Streak: count consecutive days with at least one session
    sessions_dates = (
        db.query(func.date(SessionModel.created_at))
        .filter(SessionModel.user_id == current_user.id)
        .distinct()
        .order_by(func.date(SessionModel.created_at).desc())
        .all()
    )
    streak = 0
    check = datetime.utcnow().date()
    for (d,) in sessions_dates:
        if d == check or d == check - timedelta(days=1):
            streak += 1
            check = d - timedelta(days=1)
        else:
            break

    # Scores over time (last 30 days, one row per session)
    recent = (
        db.query(SessionModel)
        .filter(
            SessionModel.user_id == current_user.id,
            SessionModel.created_at >= day30,
        )
        .order_by(SessionModel.created_at.asc())
        .all()
    )
    scores_over_time = [
        {
            "date": s.created_at.strftime("%Y-%m-%d"),
            "overall": s.overall_score,
            "grammar": s.grammar_score,
            "fluency": s.fluency_score,
        }
        for s in recent
    ]

    return ProgressOut(
        avg_grammar_7d=g7, avg_fluency_7d=f7, avg_overall_7d=o7,
        avg_grammar_30d=g30, avg_fluency_30d=f30, avg_overall_30d=o30,
        total_sessions=total,
        streak_days=streak,
        scores_over_time=scores_over_time,
    )
