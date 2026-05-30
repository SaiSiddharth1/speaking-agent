import json
from groq import AsyncGroq
from app.config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
You are an expert English speaking coach. Your student is practicing spoken English.

Your job:
1. Respond naturally to keep the conversation going
2. Gently correct grammar or pronunciation errors (if any)
3. Encourage the student warmly
4. Ask ONE follow-up question to keep them talking

ALWAYS respond in this exact JSON format:
{
  "reply": "your natural conversational response here",
  "correction": "corrected version of their sentence (null if no errors)",
  "encouragement": "one warm encouraging sentence",
  "follow_up_question": "one question to keep them speaking"
}

Rules:
- Never be harsh or discouraging
- Keep corrections gentle: "A more natural way to say that is..."
- Stay on topic unless student changes it
- Speak at a clear, natural pace in your text
"""

async def get_coach_response(message: str, history: list, topic: str) -> dict:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add history
    for msg in history[-6:]:   # last 3 turns only — keeps tokens low
        # Support both Pydantic model and dictionary
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else None)
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else None)
        if role and content:
            messages.append({"role": role, "content": content})
    
    # Add current user message
    messages.append({"role": "user", "content": message})
    
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=500,
    )
    
    raw = response.choices[0].message.content
    
    # Try parsing clean JSON. Sometimes LLMs return markdown-wrapped JSON (e.g. ```json ... ```)
    clean_raw = raw.strip()
    if clean_raw.startswith("```json"):
        clean_raw = clean_raw[7:]
    if clean_raw.endswith("```"):
        clean_raw = clean_raw[:-3]
    clean_raw = clean_raw.strip()

    try:
        parsed = json.loads(clean_raw)
    except json.JSONDecodeError:
        # Fallback if LLM doesn't return clean JSON
        parsed = {
            "reply": raw,
            "correction": None,
            "encouragement": "Keep going, you're doing great!",
            "follow_up_question": "Can you tell me more?"
        }
    
    parsed["raw_text"] = raw
    return parsed
