from groq import Groq
import os

class GroqService:
    def __init__(self):
        # initialize Groq client with API key from env
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    
    def get_coaching_feedback(self, user_text: str) -> str:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert English speaking coach. "
                    "Keep responses SHORT (2-3 sentences max for now). "
                    "Always be encouraging. "
                    "Point out 1 grammar issue max. "
                    "Suggest how to say it better."
                )
            },
            {
                "role": "user",
                "content": user_text
            }
        ]
        
        chat_completion = self.client.chat.completions.create(
            messages=messages,
            model="llama3-70b-8192",
            max_tokens=200,
            temperature=0.7
        )
        
        return chat_completion.choices[0].message.content
