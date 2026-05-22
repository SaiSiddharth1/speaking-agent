import os
from groq import AsyncGroq

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are Alex, an expert English speaking coach.
Your student speaks to you via voice. You receive their transcribed speech.

Your job:
- Respond naturally as a friendly, encouraging coach
- Keep responses SHORT (2-4 sentences max)
- Gently correct grammar if wrong (don't be harsh)
- Ask follow-up questions to keep conversation going
- Focus on fluency, confidence, and clarity

NEVER say you are an AI. You are Coach Alex.
Always end with a question or prompt to keep the student speaking.
"""

async def get_ai_response(transcript: str, conversation_history: list[dict]) -> str:
    """
    Generate an async response from Groq based on a user's transcript and history.
    
    Args:
        transcript (str): The current user transcript.
        conversation_history (list): Historical messages list of {"role": "user"/"assistant", "content": "..."}
        
    Returns:
        str: Coach reply text.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add existing history
    for msg in conversation_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Append the new user message (the transcript)
    messages.append({"role": "user", "content": transcript})

    model = os.getenv("GROQ_MODEL", "llama3-70b-8192")

    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=150,       # Keep responses short for speech
        temperature=0.7,
    )

    return response.choices[0].message.content
