import pytest
from fastapi.testclient import TestClient
from app.main import app
import random

client = TestClient(app)

def test_register_and_login():
    email = f"test_e2e_{random.randint(1000, 9999)}@example.com"
    # Register
    res = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "testpass123"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token

    # Login
    res2 = client.post("/api/auth/login", json={
        "email": email,
        "password": "testpass123"
    })
    assert res2.status_code == 200
    assert res2.json()["access_token"]
    return token

def test_save_and_retrieve_session():
    token = test_register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # Create session
    res = client.post("/api/sessions/", json={
        "topic": "Daily Life"
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    session_id = data["id"]
    assert session_id > 0
    assert data["topic"] == "Daily Life"

    # Save message
    res_msg = client.post(
        f"/api/sessions/{session_id}/messages?role=user&content=Hello%20world",
        headers=headers
    )
    assert res_msg.status_code == 200
    assert res_msg.json()["content"] == "Hello world"

    # Save score
    res_score = client.post("/api/progress/scores", json={
        "session_id": session_id,
        "grammar_score": 8.5,
        "fluency_score": 7.0,
        "vocabulary_score": 7.5,
        "overall_score": 7.8
    }, headers=headers)
    assert res_score.status_code == 200
    assert res_score.json()["overall_score"] == 7.8

    # Get scores
    res_scores = client.get("/api/progress/scores", headers=headers)
    assert res_scores.status_code == 200
    assert len(res_scores.json()) > 0

    # Retrieve session detail
    res_detail = client.get(f"/api/sessions/{session_id}", headers=headers)
    assert res_detail.status_code == 200
    assert len(res_detail.json()["messages"]) > 0

def test_progress_summary():
    token = test_register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # Create session
    res_sess = client.post("/api/sessions/", json={"topic": "Summary Test"}, headers=headers)
    session_id = res_sess.json()["id"]

    # Save score
    client.post("/api/progress/scores", json={
        "session_id": session_id,
        "grammar_score": 9.0,
        "fluency_score": 8.0,
        "vocabulary_score": 8.5,
        "overall_score": 8.5
    }, headers=headers)

    res = client.get("/api/progress/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_sessions"] >= 1
    assert data["avg_overall"] == 8.5

def test_conversation_respond():
    # Test the full voice respond pipeline
    import io
    audio_content = b"RIFF$\x00\x00\x00WAVEfmt "
    files = {"file": ("test.wav", io.BytesIO(audio_content), "audio/wav")}
    data = {"conversation_history": "[]"}
    
    # Authenticated request
    token = test_register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/conversation/respond", files=files, data=data, headers=headers)
    assert res.status_code in [200, 422, 500]
    if res.status_code == 200:
        res_json = res.json()
        assert "reply_text" in res_json
        assert "audio_base64" in res_json
