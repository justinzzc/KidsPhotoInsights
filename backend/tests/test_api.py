from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


def test_analyze_photo():
    # Use minimal valid base64 payload
    img_b64 = "data:image/png;base64,AAAA"
    r = client.post("/v1/analyze-photo", json={"imageBase64": img_b64, "timestamp": 1.0})
    assert r.status_code == 200
    data = r.json()
    # Keys exist per contract
    assert "childState" in data
    assert "mood" in data
    assert "weather" in data


def test_list_diary_entries():
    r = client.get("/v1/diary-entries")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


def test_delete_diary_entry():
    # Delete a random id; should return 204 even if not exists/DB disabled (MVP simplicity)
    r = client.delete("/v1/diary-entries/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 204