"""
Chat Router — Full Voice Conversation Pipeline

POST /api/chat/          → Text-based chat (existing)
POST /api/chat/voice     → Full pipeline: Audio → STT → LLM → TTS → Audio response
POST /api/chat/history   → Get conversation history for a session
DELETE /api/chat/history  → Clear conversation history for a session
"""

import io
import os
import urllib.parse
import logging
import tempfile

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse

from app.models.chat_models import ChatRequest, ChatResponse, Message
from app.services.groq_service import get_ai_response
from app.services.stt_service import transcribe_audio
from app.services.tts_service import text_to_speech
from app.services.conversation import get_history, add_message, clear_history

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


# ─────────────────────────────────────────────────────────
# POST /api/chat/ — Text-based chat (existing functionality)
# ─────────────────────────────────────────────────────────
@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        history = [m.model_dump() for m in request.conversation_history]  # pydantic v2
        if not history:
            raise HTTPException(status_code=400, detail="History cannot be empty.")

        # The latest user message is the last item in history
        transcript = history[-1]["content"]
        prev_history = history[:-1]

        reply = await get_ai_response(transcript, prev_history)

        # Append AI reply to history
        updated = list(request.conversation_history) + [
            Message(role="assistant", content=reply)
        ]

        return ChatResponse(reply=reply, updated_history=updated)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────
# POST /api/chat/voice — Full Pipeline: Audio → STT → LLM → TTS → Audio
# This is the core Day 23 endpoint.
# ─────────────────────────────────────────────────────────
@router.post("/voice")
async def voice_chat(
    audio: UploadFile = File(...),
    session_id: str = Form("default"),
):
    """
    Full voice conversation pipeline:
    1. Receive audio file from mobile app
    2. Transcribe with Whisper STT (via Groq)
    3. Get AI coaching response from Groq LLM (with conversation history)
    4. Convert AI reply to speech with Edge-TTS
    5. Return audio file as streaming response

    Headers included in response:
    - X-Transcript: URL-encoded user transcript
    - X-AI-Reply: URL-encoded AI text reply
    - X-Session-Id: The session ID used
    """
    try:
        # ── Validate audio input ──
        contents = await audio.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file received.")

        filename = audio.filename or "recording.m4a"

        # ── Step 1: STT — Transcribe user audio to text ──
        logger.info(f"[voice_chat] Transcribing audio for session={session_id}")
        transcript = await transcribe_audio(contents, filename)

        if not transcript or not transcript.strip():
            transcript = "[Unclear audio]"
            ai_reply = "I couldn't hear you clearly. Could you please repeat that?"
        else:
            # ── Step 2: Get conversation history & call LLM ──
            history = get_history(session_id)
            logger.info(f"[voice_chat] History has {len(history)} messages for session={session_id}")

            # Add user message to history BEFORE calling LLM
            add_message(session_id, "user", transcript)

            # Call Groq LLM with full conversation history
            ai_reply = await get_ai_response(transcript, history)

            # Add assistant reply to history AFTER getting response
            add_message(session_id, "assistant", ai_reply)

        # ── Step 3: TTS — Convert AI reply to audio ──
        logger.info(f"[voice_chat] Generating TTS for reply: {ai_reply[:60]}...")
        audio_bytes = await text_to_speech(ai_reply)

        # ── Step 4: Return audio stream with metadata headers ──
        headers = {
            "Access-Control-Expose-Headers": "X-Transcript, X-AI-Reply, X-Session-Id",
            "X-Transcript": urllib.parse.quote(transcript),
            "X-AI-Reply": urllib.parse.quote(ai_reply),
            "X-Session-Id": session_id,
        }

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers=headers,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[voice_chat] Pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Voice chat pipeline failed: {str(e)}")


# ─────────────────────────────────────────────────────────
# GET /api/chat/history — Retrieve conversation history
# ─────────────────────────────────────────────────────────
@router.get("/history")
async def get_session_history(session_id: str = "default"):
    """Returns the conversation history for a given session."""
    history = get_history(session_id)
    return {
        "session_id": session_id,
        "message_count": len(history),
        "messages": history,
    }


# ─────────────────────────────────────────────────────────
# DELETE /api/chat/history — Clear conversation history
# ─────────────────────────────────────────────────────────
@router.delete("/history")
async def clear_session_history(session_id: str = "default"):
    """Clears the conversation history for a given session."""
    clear_history(session_id)
    return {"status": "cleared", "session_id": session_id}
