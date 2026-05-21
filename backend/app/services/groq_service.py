from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

def get_ai_response(conversation_history: list[dict]) -> str:
    """
    conversation_history: list of {"role": "user"/"assistant", "content": "..."}
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + conversation_history

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=messages,
        max_tokens=150,       # Keep responses short for speech
        temperature=0.7,
    )

    return response.choices[0].message.content
