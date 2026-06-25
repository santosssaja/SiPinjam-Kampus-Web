"""
Integration tests for the FastAPI HTTP endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import create_app
from app.db.session import get_session
import app.models  # noqa: F401


@pytest.fixture(name="client")
def client_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def override_get_session():
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client


def register_and_login(client: TestClient, email: str, password: str, role: str = "BORROWER"):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": email, "password": password, "role": role},
    )
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return res.json()["access_token"]


class TestAuthEndpoints:
    def test_register_success(self, client: TestClient):
        res = client.post(
            "/api/v1/auth/register",
            json={"name": "Alice", "email": "alice@test.com", "password": "pass123"},
        )
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == "alice@test.com"
        assert "password_hash" not in data

    def test_register_duplicate_email(self, client: TestClient):
        payload = {"name": "Bob", "email": "bob@test.com", "password": "pass123"}
        client.post("/api/v1/auth/register", json=payload)
        res = client.post("/api/v1/auth/register", json=payload)
        assert res.status_code == 400

    def test_login_success(self, client: TestClient):
        client.post(
            "/api/v1/auth/register",
            json={"name": "Carol", "email": "carol@test.com", "password": "pass123"},
        )
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "carol@test.com", "password": "pass123"},
        )
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self, client: TestClient):
        client.post(
            "/api/v1/auth/register",
            json={"name": "Dave", "email": "dave@test.com", "password": "pass123"},
        )
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "dave@test.com", "password": "wrongpass"},
        )
        assert res.status_code == 401

    def test_get_me(self, client: TestClient):
        token = register_and_login(client, "eve@test.com", "pass123")
        res = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert res.json()["email"] == "eve@test.com"


class TestItemEndpoints:
    def test_list_items_requires_auth(self, client: TestClient):
        res = client.get("/api/v1/items")
        assert res.status_code == 401

    def test_create_item_requires_admin(self, client: TestClient):
        token = register_and_login(client, "user@test.com", "pass123", "BORROWER")
        res = client.post(
            "/api/v1/items",
            json={"code": "IT001", "name": "Projector", "quantity": 5},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 403

    def test_admin_can_create_item(self, client: TestClient):
        token = register_and_login(client, "admin@test.com", "pass123", "ADMIN")
        res = client.post(
            "/api/v1/items",
            json={"code": "IT001", "name": "Projector", "quantity": 5},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 201
        assert res.json()["code"] == "IT001"

    def test_admin_can_delete_item(self, client: TestClient):
        token = register_and_login(client, "admin2@test.com", "pass123", "ADMIN")
        res = client.post(
            "/api/v1/items",
            json={"code": "IT002", "name": "Camera", "quantity": 2},
            headers={"Authorization": f"Bearer {token}"},
        )
        item_id = res.json()["id"]
        del_res = client.delete(
            f"/api/v1/items/{item_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert del_res.status_code == 204


class TestHealthEndpoint:
    def test_health_ok(self, client: TestClient):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"
