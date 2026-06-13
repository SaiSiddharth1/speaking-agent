import requests

BASE = "http://127.0.0.1:8000"

def test():
    # 1. Health
    r = requests.get(f"{BASE}/health")
    assert r.json()["status"] == "ok", "Health check failed"
    print("Health OK")

    # 2. Register
    r = requests.post(f"{BASE}/api/auth/register", json={
        "name": "Test User",
        "email": "test@test.com",
        "password": "test1234"
    })
    # 200 (Token returned on register) or 400 = already exists (both fine for smoke test)
    print(f"Register: {r.status_code} {r.text}")

    # 3. Login
    r = requests.post(f"{BASE}/api/auth/login", data={
        "username": "test@test.com",
        "password": "test1234"
    })
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    print("Login OK")

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Dashboard
    r = requests.get(f"{BASE}/api/dashboard/summary", headers=headers)
    assert r.status_code == 200, f"Dashboard failed: {r.text}"
    print("Dashboard OK")

    # 5. Profile
    r = requests.get(f"{BASE}/api/profile/me", headers=headers)
    assert r.status_code == 200, f"Profile failed: {r.text}"
    print("Profile OK")

    # 6. Start session
    r = requests.post(f"{BASE}/api/sessions/start", headers=headers)
    assert r.status_code == 200, f"Start session failed: {r.text}"
    session_id = r.json()["id"]
    print(f"Session started: {session_id}")

    # 7. End session
    r = requests.put(f"{BASE}/api/sessions/{session_id}/end", headers=headers, json={
        "grammar_score": 75.0,
        "fluency_score": 80.0,
        "overall_score": 77.5,
        "turn_count": 3
    })
    assert r.status_code == 200, f"End session failed: {r.text}"
    print("Session ended")

    # 8. History
    r = requests.get(f"{BASE}/api/sessions/", headers=headers)
    assert r.status_code == 200, f"List sessions failed: {r.text}"
    print(f"History: {len(r.json())} sessions")

    # 9. Progress
    r = requests.get(f"{BASE}/api/progress/weekly", headers=headers)
    assert r.status_code == 200, f"Progress failed: {r.text}"
    print("Progress OK")

    print("\nAll smoke tests passed!")

if __name__ == "__main__":
    test()
