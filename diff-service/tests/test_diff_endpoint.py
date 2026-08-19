from urllib import response

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "schemantics-diff-service"}


def test_diff_endpoint_no_changes():
    payload = {
        "baselineSchema": {"title": "string", "id": "number"},
        "newResponseJson": {"title": "Breaking News", "id": 317},
    }
    response = client.post("/diff", json=payload)
    assert response.status_code == 200
    assert response.json() == []


def test_diff_endpoint_detects_removed_field():
    payload = {
        "baselineSchema": {"title": "string", "content": "string"},
        "newResponseJson": {"title": "Breaking News"},
    }
    response = client.post("/diff", json=payload)
    assert response.status_code == 200
    assert response.json() == [
        {
            "path": "content",
            "changeType": "removed",
            "oldType": "string",
            "newType": None,
            "severity": "breaking",
        },
    ]

def test_diff_endpoint_detects_type_change():
    payload = {
        "baselineSchema": {"id": "number"},
        "newResponseJson": {"id": "317"},
    }
    response = client.post("/diff", json=payload)
    assert response.status_code == 200
    assert response.json() == [
        {
            "path": "id",
            "changeType": "type_changed",
            "oldType": "number",
            "newType": "string",
            "severity": "breaking",
        },
    ]

def test_diff_endpoint_matches_spec_example():
    payload = {
        "baselineSchema": {"title": "string", "content": "string", "id": "number"},
        "newResponseJson": {"title": "Breaking News", "headline": "Same story, new field", "id": "317"},
    }
    response = client.post("/diff", json=payload)
    assert response.status_code == 200

    result = response.json()
    change_types = {d["path"]: d["changeType"] for d in result}
    severities = {d["path"]: d["severity"] for d in result}
    assert change_types == {
        "content": "removed",
        "headline": "added",
        "id": "type_changed",
    }
    assert severities == {
        "content": "breaking",
        "headline": "warning",
        "id": "breaking",
    }


def test_diff_endpoint_missing_baseline_schema_returns_422():
    response = client.post("/diff", json={"newResponseJson": {"a": 1}})
    assert response.status_code == 422