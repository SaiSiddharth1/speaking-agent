import sys
import os
import asyncio
from fastapi.testclient import TestClient

# Ensure backend directory is in the path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.main import app
from app.services.groq_service import get_coach_response

client = TestClient(app)

async def test_groq_service():
    print("\n--- Testing Groq Service ---")
    
    # 1. Normal Coaching Request
    print("1. Sending sample transcript...")
    transcript = "Yesterday I goes to the market and buyed some apples."
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hello! How can I help you practice English today?"}
    ]
    
    res = await get_coach_response(transcript=transcript, history=history)
    print("Groq service response:")
    print(f"Reply: {res.get('reply')}")
    print(f"Grammar issues: {res.get('grammar_issues')}")
    print(f"Fluency score: {res.get('fluency_score')}")
    print(f"Vocabulary score: {res.get('vocabulary_score')}")
    print(f"Suggestion: {res.get('suggestion')}")
    
    # Assertions
    assert "reply" in res
    assert isinstance(res["grammar_issues"], list)
    assert isinstance(res["fluency_score"], int)
    assert "suggestion" in res
    print("Normal Coaching Request: PASS")

    # 2. Malformed / Empty JSON Fallback Simulation
    print("\n2. Simulating Groq parsing error fallback...")
    # Passing None to trigger an exception / fallback in get_coach_response
    res_fallback = await get_coach_response(transcript=None, history=None)
    print("Groq fallback response:")
    print(res_fallback)
    assert "reply" in res_fallback
    assert res_fallback["grammar_issues"] == []
    print("Fallback simulation: PASS")

def test_api_endpoint():
    print("\n--- Testing POST /conversation/chat API Endpoint ---")
    payload = {
        "transcript": "Me want to learn English very good.",
        "session_id": "test_session_999",
        "history": [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Welcome! Tell me about your day."}
        ]
    }
    
    response = client.post("/conversation/chat", json=payload)
    print(f"Endpoint Status Code: {response.status_code}")
    print("Endpoint JSON response:")
    data = response.json()
    print(data)
    
    assert response.status_code == 200
    assert "reply" in data
    assert "audio_url" in data
    assert isinstance(data["grammar_issues"], list)
    assert "fluency_score" in data
    assert "suggestion" in data
    
    # Check that audio file actually exists on disk
    audio_url = data["audio_url"]
    filename = audio_url.split("/")[-1]
    static_file_path = os.path.join(os.getcwd(), "static", filename)
    print(f"Checking if generated audio file exists at: {static_file_path}")
    assert os.path.exists(static_file_path)
    print(f"Audio file size: {os.path.getsize(static_file_path)} bytes")
    print("API Endpoint test: PASS")

if __name__ == "__main__":
    # Run async test for Groq service
    asyncio.run(test_groq_service())
    # Run sync test for API endpoint
    test_api_endpoint()
    print("\nAll tests completed successfully!")
