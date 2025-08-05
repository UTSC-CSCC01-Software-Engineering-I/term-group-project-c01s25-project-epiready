import pytest
from flask import Flask
import controllers.auth as auth_mod

@pytest.fixture
def app():
    app = Flask(__name__)
    app.secret_key = "test_secret_key"
    app.add_url_rule("/auth/signup", view_func=auth_mod.signup, methods=["POST"])
    app.add_url_rule("/auth/login",  view_func=auth_mod.login,  methods=["POST"])
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_signup_missing_fields(client):
    r = client.post("/auth/signup", json={})
    assert r.status_code == 400
    assert b"required" in r.data

def test_signup_success(monkeypatch, client):
    def mock_create_user(email, password): return True
    monkeypatch.setattr(auth_mod, "create_user", mock_create_user)
    r = client.post("/auth/signup", json={"email": "a@b.com", "password": "123"})
    assert r.status_code == 200
    assert b"User registered successfully" in r.data

def test_signup_duplicate(monkeypatch, client):
    def mock_create_user(email, password): return False
    monkeypatch.setattr(auth_mod, "create_user", mock_create_user)
    r = client.post("/auth/signup", json={"email": "a@b.com", "password": "123"})
    assert r.status_code == 400
    assert b"already registered" in r.data

def test_login_missing_fields(client):
    r = client.post("/auth/login", json={})
    assert r.status_code == 400
    assert b"required" in r.data

def test_login_wrong_credentials(monkeypatch, client):
    def mock_verify_user(email, password): return None
    monkeypatch.setattr(auth_mod, "verify_user", mock_verify_user)
    r = client.post("/auth/login", json={"email": "a@b.com", "password": "wrong"})
    assert r.status_code == 401
    assert b"Wrong username/password" in r.data

def test_login_success(monkeypatch, client):
    class MockUser: id = 1
    def mock_verify_user(email, password): return MockUser()
    monkeypatch.setattr(auth_mod, "verify_user", mock_verify_user)
    r = client.post("/auth/login", json={"email": "a@b.com", "password": "123"})
    assert r.status_code == 200
    assert b"Login successful" in r.data
    assert b"token" in r.data
