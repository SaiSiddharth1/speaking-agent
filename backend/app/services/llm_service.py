import os
from groq import AsyncGroq
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an expert English speaking coach. Your job is to:
1. Have a natural conversation with the user in English
2. Gently correct grammar mistakes (don't interrupt flow)
3. Suggest better vocabulary when appropriate
4. Give confidence-building encouragement
5. Keep responses concise (2-4 sentences max)
6. Ask follow-up questions to keep the conversation going

Always respond in a warm, supportive, teacher-like tone."""

async def get_coach_reply(user_message: str, history: list) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Extend messages with conversation history
    # Expect history to be a list of dicts with 'role' and 'content'
    messages += history
    # Add current user message
    messages.append({"role": "user", "content": user_message})

    try:
        response = await client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            max_tokens=200,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        # Log the error (optional) and return a friendly error message
        print(f"Error calling Groq API: {e}")
        return "I'm sorry, I'm having a little trouble connecting right now. Let's try again in a moment!"
