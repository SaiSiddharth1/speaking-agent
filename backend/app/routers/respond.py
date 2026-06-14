"""
Respond Router — Full Voice Conversation Pipeline

POST /api/conversation/respond
    Accepts multipart/form-data with:
        - file: audio file (UploadFile)
        - conversation_history: JSON string of message history (Form)
    Returns JSON:
        - reply_text: AI coach's text response
        - audio_base64: base64-encoded MP3 of TTS response
        - updated_history: updated conversation history array
        - user_text / coach_text: aliases for mobile compatibility
        - score: scoring result from the scoring service
"""

import base64
import json
import logging
import urllib.parse
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session as DBSession
from app.services.stt_service import transcribe_audio
from app.services.groq_service import get_ai_response
from app.services.tts_service import text_to_speech
from app.services.scoring_service import evaluate_transcript
from app.database import get_db
from app.models.session import ConversationSession, Message
from app.models.score import Score
from app.models.user import User
from app.auth_utils import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter(tags=["conversation"])


@router.post("/respond")
async def respond_to_voice(
    file: UploadFile = File(...),
    conversation_history: str = Form(default="[]"),
    db: DBSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Full voice conversation pipeline:
    1. Receive audio file + conversation history from mobile app
    2. Transcribe audio with Groq Whisper STT
    3. Get AI coaching response from Groq LLM (with conversation context)
    4. Convert AI reply to speech with Edge-TTS
    5. Score the user's transcript
    6. Persist session to DB if user is authenticated
    7. Return JSON with reply text, base64 audio, and scores
    """
    try:
        # ── Validate audio input ──
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file received.")

        filename = file.filename or "recording.m4a"

        # ── Step 1: Parse conversation history from JSON string ──
        try:
            history = json.loads(conversation_history)
            if not isinstance(history, list):
                history = []
        except (json.JSONDecodeError, TypeError):
            logger.warning("[respond] Invalid conversation_history JSON, using empty list")
            history = []

        # ── Step 2: STT — Transcribe user audio to text ──
        logger.info(f"[respond] Transcribing audio ({len(contents)} bytes, filename={filename})")
        transcript = await transcribe_audio(contents, filename)

        if not transcript or not transcript.strip():
            transcript = "[Unclear audio]"
            reply_text = "I couldn't hear you clearly. Could you please repeat that?"
        else:
            # ── Step 3: LLM — Get AI coaching response ──
            logger.info(f"[respond] Transcript: {transcript[:80]}...")
            reply_text = await get_ai_response(transcript, history)

        # ── Step 4: TTS — Convert AI reply to speech bytes ──
        logger.info(f"[respond] Generating TTS for: {reply_text[:60]}...")
        audio_bytes = await text_to_speech(reply_text)

        # ── Step 5: Encode audio as base64 ──
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        # ── Step 6: Score the transcript ──
        score_result = {"grammar_score": 0, "fluency_score": 0, "overall_score": 0, "feedback_tips": []}
        try:
            scored = await evaluate_transcript(transcript)
            score_result = {
                "grammar_score": scored.grammar_score,
                "fluency_score": scored.fluency_score,
                "overall_score": scored.overall_score,
                "feedback_tips": scored.feedback,
            }
        except Exception as score_err:
            logger.warning(f"[respond] Scoring failed (non-fatal): {score_err}")

        if current_user:
            try:
                db_session = ConversationSession(
                    user_id=current_user.id,
                    topic="General"
                )
                db.add(db_session)
                db.flush()

                db.add(Message(
                    session_id=db_session.id, role="user", content=transcript
                ))
                db.add(Message(
                    session_id=db_session.id, role="assistant",
                    content=reply_text
                ))

                db_score = Score(
                    session_id=db_session.id,
                    user_id=current_user.id,
                    grammar_score=score_result.get("grammar_score", 0.0),
                    fluency_score=score_result.get("fluency_score", 0.0),
                    vocabulary_score=score_result.get("overall_score", 0.0),
                    overall_score=score_result.get("overall_score", 0.0)
                )
                db.add(db_score)
                db.commit()
            except Exception as db_err:
                logger.warning(f"[respond] DB save failed (non-fatal): {db_err}")
                db.rollback()

        # ── Step 8: Build updated conversation history ──
        updated_history = list(history) + [
            {"role": "user", "content": transcript},
            {"role": "assistant", "content": reply_text},
        ]

        return {
            "reply_text": reply_text,
            "audio_base64": audio_base64,
            "updated_history": updated_history,
            "user_transcript": transcript,
            # Mobile-compatible aliases
            "user_text": transcript,
            "coach_text": reply_text,
            "score": score_result,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[respond] Pipeline error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Voice conversation pipeline failed: {str(e)}"
        )
