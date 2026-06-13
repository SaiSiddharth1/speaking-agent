from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db
from app.models.session import Session
from app.dependencies import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("/weekly")
def weekly_progress(
    weeks: int = Query(default=4, le=12),
    current_user=Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Returns daily averages for the last N weeks."""
    since = datetime.utcnow() - timedelta(weeks=weeks)
    sessions = (
        db.query(Session)
        .filter(
            Session.user_id == current_user.id,
            Session.ended_at >= since,
            Session.ended_at.isnot(None),
        )
        .all()
    )

    # Group by date
    days: dict = {}
    for s in sessions:
        day = s.ended_at.strftime("%Y-%m-%d")
        if day not in days:
            days[day] = {"grammar": [], "fluency": [], "overall": []}
        days[day]["grammar"].append(s.grammar_score or 0)
        days[day]["fluency"].append(s.fluency_score or 0)
        days[day]["overall"].append(s.overall_score or 0)

    result = []
    for day, scores in sorted(days.items()):
        result.append({
            "date": day,
            "grammar": round(sum(scores["grammar"]) / len(scores["grammar"]), 1),
            "fluency": round(sum(scores["fluency"]) / len(scores["fluency"]), 1),
            "overall": round(sum(scores["overall"]) / len(scores["overall"]), 1),
        })
    return result

@router.get("/monthly")
def monthly_progress(
    months: int = Query(default=3, le=6),
    current_user=Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Returns weekly averages bucketed by month."""
    since = datetime.utcnow() - timedelta(days=30 * months)
    sessions = (
        db.query(Session)
        .filter(
            Session.user_id == current_user.id,
            Session.ended_at >= since,
            Session.ended_at.isnot(None),
        )
        .all()
    )

    months_data: dict = {}
    for s in sessions:
        key = s.ended_at.strftime("%Y-%m")
        if key not in months_data:
            months_data[key] = {"grammar": [], "fluency": [], "overall": []}
        months_data[key]["grammar"].append(s.grammar_score or 0)
        months_data[key]["fluency"].append(s.fluency_score or 0)
        months_data[key]["overall"].append(s.overall_score or 0)

    result = []
    for month, scores in sorted(months_data.items()):
        result.append({
            "month": month,
            "grammar": round(sum(scores["grammar"]) / len(scores["grammar"]), 1),
            "fluency": round(sum(scores["fluency"]) / len(scores["fluency"]), 1),
            "overall": round(sum(scores["overall"]) / len(scores["overall"]), 1),
        })
    return result
