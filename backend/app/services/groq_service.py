import json
import logging
from groq import AsyncGroq
from app.config import settings

logger = logging.getLogger(__name__)

# Use GROQ_API_KEY from settings
client = AsyncGroq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are an expert English speaking coach. The user is practicing spoken English.

When the user speaks, you must:
1. Reply naturally to continue the conversation
2. Evaluate their English (grammar, fluency, vocabulary)
3. Return ONLY valid JSON in this format:
{
  "reply": "your natural conversational response",
  "grammar_issues": ["issue 1", "issue 2"],  
  "fluency_score": 7,
  "vocabulary_score": 6,
  "suggestion": "one concrete improvement tip"
}"""

async def get_coach_response(
    transcript: str = None,
    history: list = None,
    message: str = None,
    topic: str = None
) -> dict:
    """
    Accepts user input (transcript or message) along with history,
    calls Groq LLM, and returns structured coaching feedback.
    """
    # Resolve message/transcript for compatibility
    user_msg = transcript or message or ""
    history_list = history or []
    
    # Cap history at last 10 messages (5 turns)
    capped_history = history_list[-10:]
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add history
    for msg in capped_history:
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else None)
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else None)
        if role and content:
            messages.append({"role": role, "content": content})
            
    # Add current user message
    messages.append({"role": "user", "content": user_msg})
    
    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        
        raw = response.choices[0].message.content
        
        # Try parsing clean JSON. Sometimes LLMs return markdown-wrapped JSON (e.g. ```json ... ```)
        clean_raw = raw.strip()
        if clean_raw.startswith("```json"):
            clean_raw = clean_raw[7:]
        if clean_raw.endswith("```"):
            clean_raw = clean_raw[:-3]
        clean_raw = clean_raw.strip()
        
        parsed = json.loads(clean_raw)
        
        # Ensure correct keys are present
        if "reply" not in parsed:
            parsed["reply"] = raw
        if "grammar_issues" not in parsed:
            parsed["grammar_issues"] = []
        if "fluency_score" not in parsed:
            parsed["fluency_score"] = 7
        if "vocabulary_score" not in parsed:
            parsed["vocabulary_score"] = 6
        if "suggestion" not in parsed:
            parsed["suggestion"] = "Keep practicing!"
            
        return parsed
        
    except Exception as e:
        logger.error(f"Error calling Groq or parsing JSON: {e}", exc_info=True)
        # Fallback response for malformed JSON/API error
        return {
            "reply": "That is interesting! Can you tell me more?",
            "grammar_issues": [],
            "fluency_score": 7,
            "vocabulary_score": 6,
            "suggestion": "Try expressing your thoughts in full sentences.",
            "error_detail": str(e)
        }


async def get_ai_response(user_message: str, history: list, level: str = "intermediate") -> str:
    """
    Backwards compatibility helper for old chat endpoints.
    Calls the new get_coach_response and returns the conversational string response.
    """
    history_dicts = []
    for msg in history:
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else None)
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else None)
        if role and content:
            history_dicts.append({"role": role, "content": content})
            
    res = await get_coach_response(transcript=user_message, history=history_dicts)
    return res.get("reply", "That's interesting! Let's keep practicing English.")

