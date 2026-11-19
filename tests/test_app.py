from app import app


def test_health_returns_ok():
    client = app.test_client()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_api_info_returns_expected_fields():
    client = app.test_client()
    response = client.get("/api/info")
    data = response.get_json()
    assert response.status_code == 200
    assert data["message"] == "Hello from the DevOps demo app"
    assert {"environment", "version", "hostname"} <= data.keys()


def test_index_serves_the_web_page():
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert response.mimetype == "text/html"
    assert b"DevOps Demo App" in response.data


def test_static_files_are_served():
    client = app.test_client()
    assert client.get("/static/app.js").status_code == 200
    assert client.get("/static/style.css").status_code == 200
