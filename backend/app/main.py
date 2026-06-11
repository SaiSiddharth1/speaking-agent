import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.routers import auth, stt, chat, transcribe, speech, conversation, score, respond
from app.routers import auth_router, sessions, progress
from app.routes import conversation as conversation_new

# Import models so they are registered with Base.metadata
from app.models import user, conversation as conv_model, session as session_model

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
app.include_router(auth_router.router)
app.include_router(stt.router)
app.include_router(chat.router)
app.include_router(transcribe.router)
app.include_router(speech.router)
app.include_router(conversation.router, prefix="/api/conversation")
app.include_router(respond.router, prefix="/api/conversation")
app.include_router(conversation_new.router)
app.include_router(score.router, prefix="/api")
app.include_router(sessions.router)
app.include_router(progress.router)

# Mount the static files directory to serve generated TTS audio files
static_dir = os.path.join(os.getcwd(), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def root():
    return {"status": "Speaking Agent API running"}

@app.get("/health")
def health():
    return {"status": "ok"}