from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, stt, chat, transcribe, speech, conversation

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Speaking Agent API")

# CORS — allow mobile app to access custom response headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Transcript", "X-AI-Reply", "X-Session-Id"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(stt.router)
app.include_router(chat.router)
app.include_router(transcribe.router)
app.include_router(speech.router)
app.include_router(conversation.router, prefix="/api/conversation")


@app.get("/")
def root():
    return {"status": "Speaking Agent API running"}