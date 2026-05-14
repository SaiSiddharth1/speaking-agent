import asyncio
from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
You are an expert English speaking coach named "Alex".
Your job is to help non-native English speakers improve their:
- Fluency and confidence
- Grammar and vocabulary
- Pronunciation awareness
- Speaking clarity

Rules:
1. Always respond conversationally in 2-4 sentences max
2. Gently correct grammar mistakes (don't ignore them)
3. Encourage the user — be positive and supportive
4. After your response, add a "Coach Tip:" with one specific improvement
5. Ask a follow-up question to keep the conversation going
6. Adapt to the user's level: {level}

Format your response like this:
[Your conversational response]

💡 Coach Tip: [one specific tip]
❓ [follow-up question]
"""

async def get_ai_response(
    user_message: str,
    history: list,
    level: str = "intermediate"
) -> dict:
    # 1. Build system prompt with level
    formatted_system_prompt = SYSTEM_PROMPT.format(level=level).strip()
    
    # 2. Build messages array: [system] + history + [new user message]
    messages = [{"role": "system", "content": formatted_system_prompt}]
    
    # Map history cleanly to role/content pairs
    for msg in history:
        role = msg["role"] if isinstance(msg, dict) else getattr(msg, "role", "")
        content = msg["content"] if isinstance(msg, dict) else getattr(msg, "content", "")
        if role and content:
            messages.append({"role": role, "content": content})
            
    messages.append({"role": "user", "content": user_message})
    
    # 3. Call client.chat.completions.create asynchronously using threads to prevent blocking
    def _call_groq():
        return client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )

    response = await asyncio.to_thread(_call_groq)
    
    # 4. Extract response text
    ai_response_text = response.choices[0].message.content

    # 5. Update history with new user + assistant messages
    updated_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": ai_response_text}
    ]
    
    # 6. Return { "response": text, "history": updated_history }
    return {
        "response": ai_response_text,
        "history": updated_history
    }
