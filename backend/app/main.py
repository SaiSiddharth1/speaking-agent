from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, stt, chat, transcribe, speech, conversation

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Speaking Agent API")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(stt.router)
app.include_router(chat.router)
app.include_router(transcribe.router)
app.include_router(speech.router)
app.include_router(conversation.router)


@app.get("/")
def root():
    return {"status": "Speaking Agent API running"}