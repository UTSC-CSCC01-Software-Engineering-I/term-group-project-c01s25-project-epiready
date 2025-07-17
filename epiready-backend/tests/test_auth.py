import pytest
from flask import Flask
from controllers.auth import signup, login, generate_token
import jwt


@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    app.config["TESTING"] = True

    from controllers import auth as auth_ctrl

    class DummySession:
        def add(self, obj): pass
        def commit(self): pass
        def rollback(self): pass

    class DBStub:
        def __call__(self, *a, **k):
            return self
        @property
        def session(self):
            return DummySession()
        def init_app(self, app): pass

    monkeypatch.setattr(auth_ctrl, "db", DBStub(), raising=False)

    app.add_url_rule('/auth/signup', view_func=signup, methods=['POST'])
    app.add_url_rule('/auth/login', view_func=login, methods=['POST'])
    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_signup_missing_email(client):
    response = client.post('/auth/signup', json={'password': 'password123'})
    assert response.status_code == 400
    assert b"both email and password" in response.data


def test_signup_missing_password(client):
    response = client.post('/auth/signup', json={'email': 'test@example.com'})
    assert response.status_code == 400
    assert b"both email and password" in response.data


def test_signup_invalid_role(client):
    response = client.post('/auth/signup', json={'email': 'test@example.com', 'password': 'pw', 'role': 'invalid'})
    assert response.status_code == 400
    assert b"Invalid role" in response.data


def test_signup_duplicate_email(monkeypatch, client):
    from controllers import auth as auth_ctrl
    monkeypatch.setattr(auth_ctrl, "create_user", lambda email, password, role: False)
    response = client.post('/auth/signup', json={'email': 'exists@example.com', 'password': 'pw', 'role': 'manufacturer'})
    assert response.status_code == 400
    assert b"already registered" in response.data


def test_signup_success(monkeypatch, client):
    from controllers import auth as auth_ctrl
    monkeypatch.setattr(auth_ctrl, "create_user", lambda email, password, role: True)
    response = client.post('/auth/signup', json={'email': 'new@example.com', 'password': 'pw', 'role': 'manufacturer'})
    assert response.status_code == 200
    assert b"registered successfully" in response.data


def test_login_missing_email(client):
    response = client.post('/auth/login', json={'password': 'pw'})
    assert response.status_code == 400
    assert b"Email and password required" in response.data


def test_login_missing_password(client):
    response = client.post('/auth/login', json={'email': 'test@example.com'})
    assert response.status_code == 400
    assert b"Email and password required" in response.data


def test_login_invalid_credentials(monkeypatch, client):
    from controllers import auth as auth_ctrl
    monkeypatch.setattr(auth_ctrl, "verify_user", lambda email, password: None)
    response = client.post('/auth/login', json={'email': 'bad@example.com', 'password': 'badpw'})
    assert response.status_code == 401
    assert b"Wrong username/password" in response.data


def test_login_success(monkeypatch, client):
    from controllers import auth as auth_ctrl
    class MockUser:
        id = 42
    monkeypatch.setattr(auth_ctrl, "verify_user", lambda email, password: MockUser())
    response = client.post('/auth/login', json={'email': 'good@example.com', 'password': 'goodpw'})
    assert response.status_code == 200
    assert b"Login successful" in response.data
    assert b"token" in response.data
    assert b"user_id" in response.data


def test_generate_token(app):
    with app.app_context():
        user_id = 123
        token = generate_token(user_id)
        decoded = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        assert decoded["user_id"] == user_id
        assert "exp" in decoded
        assert "iat" in decoded
