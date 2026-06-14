import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.error_handlers import register_error_handlers
from app.routers import (
    auth,
    stt,
    chat,
    transcribe,
    speech,
    conversation,
    score,
    respond,
    sessions,
    dashboard,
    profile,
    progress,
)

# Import models so they are registered with Base.metadata
import app.models.user
import app.models.session
import app.models.score

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Speaking Agent API")

@app.on_event("startup")
def startup():
    pass

# CORS — allow mobile app to access custom response headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Transcript", "X-AI-Reply", "X-Session-Id"],
)

# Auth and API routes
app.include_router(auth.router)
app.include_router(stt.router)
app.include_router(chat.router)
app.include_router(transcribe.router)
app.include_router(speech.router)
app.include_router(conversation.router, prefix="/api/conversation")
app.include_router(respond.router, prefix="/api/conversation")
app.include_router(score.router, prefix="/api")
app.include_router(sessions.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(progress.router)

register_error_handlers(app)

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