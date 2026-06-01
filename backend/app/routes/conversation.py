import os
import time
import logging
from fastapi import APIRouter, HTTPException
from app.models.conversation import ChatRequest, ChatResponse
from app.services.groq_service import get_coach_response
from app.services.tts_service import text_to_speech_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversation", tags=["conversation"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_coach(request: ChatRequest):
    """
    Day 26 Endpoint: POST /conversation/chat
    Processes transcribed voice input, sends to Groq English Coach,
    saves the synthesized reply as a static MP3 audio file,
    and returns a structured JSON coach evaluation response.
    """
    try:
        # Convert request history items into list of dicts
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Call the Groq LLM service
        coach_res = await get_coach_response(
            transcript=request.transcript,
            history=history_dicts
        )
        
        reply_text = coach_res.get("reply", "")
        
        # Generate an audio file named with session_id + timestamp
        timestamp = int(time.time())
        filename = f"response_{request.session_id}_{timestamp}.mp3"
        
        # Ensure static folder exists in the project root
        static_dir = os.path.join(os.getcwd(), "static")
        os.makedirs(static_dir, exist_ok=True)
        
        file_path = os.path.join(static_dir, filename)
        
        # Save generated speech audio to file
        await text_to_speech_file(reply_text, file_path)
        
        # Construct response JSON
        return ChatResponse(
            reply=reply_text,
            audio_url=f"/static/{filename}",
            grammar_issues=coach_res.get("grammar_issues", []),
            fluency_score=coach_res.get("fluency_score", 7),
            suggestion=coach_res.get("suggestion", "Keep practicing!")
        )
        
    except Exception as e:
        logger.error(f"Error in chat_with_coach endpoint: {e}", exc_info=True)
        # Graceful fallback to avoid any 500 server error
        fallback_reply = "I apologize, but I encountered a small system hiccup. Let's keep practicing! What else would you like to talk about?"
        try:
            timestamp = int(time.time())
            filename = f"fallback_{request.session_id}_{timestamp}.mp3"
            static_dir = os.path.join(os.getcwd(), "static")
            os.makedirs(static_dir, exist_ok=True)
            file_path = os.path.join(static_dir, filename)
            await text_to_speech_file(fallback_reply, file_path)
            
            return ChatResponse(
                reply=fallback_reply,
                audio_url=f"/static/{filename}",
                grammar_issues=[],
                fluency_score=7,
                suggestion="Stay confident and keep sharing your thoughts!"
            )
        except Exception as tts_err:
            logger.error(f"Critical fallback TTS failed: {tts_err}")
            raise HTTPException(status_code=500, detail=f"Critical pipeline error: {str(e)}")
