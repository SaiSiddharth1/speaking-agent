from sqlalchemy.orm import Session
from app.models.session import ConversationSession
from app.schemas.session import SessionCreate

def save_session(db: Session, user_id: int, data: SessionCreate) -> ConversationSession:
    session = ConversationSession(user_id=user_id, **data.dict())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_user_sessions(db: Session, user_id: int, limit: int = 20):
    return (
        db.query(ConversationSession)
        .filter(ConversationSession.user_id == user_id)
        .order_by(ConversationSession.created_at.desc())
        .limit(limit)
        .all()
    )
