from groq import Groq
import os, json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

PROMPT_TEMPLATE = """
You are an expert English pronunciation coach.

The student said: "{transcript}"

Identify 2-3 words that may be mispronounced by non-native speakers.
For each word, give a phonetic hint and a simple memory trick.

Return ONLY a JSON array like:
[
  {{"word": "comfortable", "phonetic": "KUMF-ter-bul", "tip": "Drop the middle syllable"}}
]
No markdown, no preamble.
"""

def get_pronunciation_hints(transcript: str) -> list:
    # Ensure client has key before making request, fallback to dummy/empty on CI or if key missing
    if not os.getenv("GROQ_API_KEY"):
        return [
            {"word": "comfortable", "phonetic": "KUMF-ter-bul", "tip": "Drop the middle syllable"},
            {"word": "Wednesday", "phonetic": "WENZ-day", "tip": "D is silent"}
        ]
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": PROMPT_TEMPLATE.format(transcript=transcript)}],
            temperature=0,
            max_tokens=300,
        )
        raw = response.choices[0].message.content.strip()
        return json.loads(raw)
    except Exception:
        return []
