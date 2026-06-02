import sys
import os
import asyncio
from fastapi.testclient import TestClient

# Ensure backend directory is in the path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.main import app
from app.services.scoring_service import evaluate_transcript

client = TestClient(app)

async def test_scoring_service():
    print("\n--- Testing Scoring Service ---")
    
    # 1. Normal Transcript Evaluation
    transcript = "Yesterday I go to the market and buyed some apple."
    print(f"Evaluating transcript: \"{transcript}\"")
    
    res = await evaluate_transcript(transcript)
    print("Scoring service response:")
    print(f"Grammar Score: {res.grammar_score}")
    print(f"Fluency Score: {res.fluency_score}")
    print(f"Overall Score: {res.overall_score}")
    print(f"Feedback: {res.feedback}")
    
    # Assertions
    assert isinstance(res.grammar_score, int)
    assert 0 <= res.grammar_score <= 100
    assert isinstance(res.fluency_score, int)
    assert 0 <= res.fluency_score <= 100
    assert isinstance(res.overall_score, int)
    assert 0 <= res.overall_score <= 100
    assert isinstance(res.feedback, list)
    assert 2 <= len(res.feedback) <= 3
    print("Scoring Service Request: PASS")

    # 2. Empty Transcript Handling
    print("\nSimulating empty transcript...")
    res_empty = await evaluate_transcript("")
    print("Empty transcript response:")
    print(f"Grammar Score: {res_empty.grammar_score}")
    print(f"Feedback: {res_empty.feedback}")
    assert res_empty.grammar_score == 0
    assert len(res_empty.feedback) > 0
    print("Empty Transcript Handling: PASS")

def test_api_endpoint():
    print("\n--- Testing POST /api/score API Endpoint ---")
    payload = {
        "transcript": "Me want to learn English very good."
    }
    
    response = client.post("/api/score", json=payload)
    print(f"Endpoint Status Code: {response.status_code}")
    print("Endpoint JSON response:")
    data = response.json()
    print(data)
    
    assert response.status_code == 200
    assert "grammar_score" in data
    assert "fluency_score" in data
    assert "overall_score" in data
    assert isinstance(data["feedback"], list)
    print("API Endpoint test: PASS")

def test_api_endpoint_error_handling():
    print("\n--- Testing POST /api/score Error Handling (Malformed JSON) ---")
    from unittest.mock import AsyncMock, patch
    
    # Mocking the Groq completion to return invalid JSON
    mock_response = AsyncMock()
    mock_response.choices = [
        AsyncMock(message=AsyncMock(content="{\"grammar_score\": 90, malformed-json"))
    ]
    
    with patch("app.services.scoring_service.settings") as mock_settings, \
         patch("app.services.scoring_service.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
        
        mock_settings.GROQ_API_KEY = "real_mocked_key"
        mock_settings.GROQ_MODEL = "llama3-70b-8192"
        mock_create.return_value = mock_response
        
        payload = {
            "transcript": "Hello world"
        }
        
        response = client.post("/api/score", json=payload)
        print(f"Endpoint Error Status Code: {response.status_code}")
        print("Endpoint Error JSON response:")
        data = response.json()
        print(data)
        
        assert response.status_code == 500
        assert "detail" in data
        assert "LLM returned invalid JSON structure" in data["detail"]
        print("API Endpoint Error Handling test: PASS")

if __name__ == "__main__":
    # Run async test for scoring service
    asyncio.run(test_scoring_service())
    # Run sync test for API endpoint
    test_api_endpoint()
    # Run sync test for error handling
    test_api_endpoint_error_handling()
    print("\nAll scoring tests completed successfully!")
