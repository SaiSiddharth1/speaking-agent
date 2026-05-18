import os
from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
You are an expert English speaking coach. 
Your job is to:
1. Respond naturally to what the user said
2. Gently correct any grammar mistakes
3. Suggest better ways to express their idea
4. Keep responses short (2-4 sentences max)
5. Be encouraging and supportive

Always end with a follow-up question to keep the conversation going.
"""

def get_ai_response(transcript: str) -> str:
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": transcript}
        ],
        model="llama3-70b-8192",
        max_tokens=200,
        temperature=0.7
    )
    return chat_completion.choices[0].message.content
