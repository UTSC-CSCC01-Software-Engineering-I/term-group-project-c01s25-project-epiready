import pytest
from flask import Flask
from controllers.auth import signup, login

@pytest.fixture
def app():
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    app.add_url_rule('/auth/signup', view_func=signup, methods=['POST'])
    app.add_url_rule('/auth/login', view_func=login, methods=['POST'])
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_signup_missing_fields(client):
    response = client.post('/auth/signup', json={})
    assert response.status_code == 400
    assert b"required" in response.data
 
def test_signup_invalid_role(client):
    response = client.post('/auth/signup', json={"email": "a@b.com", "password": "123", "role": "invalid"})
    assert response.status_code == 400
    assert b"Invalid role" in response.data

def test_signup_success(monkeypatch, client):
    def mock_create_user(email, password, role):
        return True
    monkeypatch.setattr('controllers.auth.create_user', mock_create_user)
    response = client.post('/auth/signup', json={"email": "a@b.com", "password": "123", "role": "manufacturer"})
    assert response.status_code == 200
    assert b"User registered successfully" in response.data

def test_signup_duplicate(monkeypatch, client):
    def mock_create_user(email, password, role):
        return False
    monkeypatch.setattr('controllers.auth.create_user', mock_create_user)
    response = client.post('/auth/signup', json={"email": "a@b.com", "password": "123", "role": "manufacturer"})
    assert response.status_code == 400
    assert b"already registered" in response.data

def test_login_missing_fields(client):
    response = client.post('/auth/login', json={})
    assert response.status_code == 400
    assert b"required" in response.data

def test_login_wrong_credentials(monkeypatch, client):
    def mock_verify_user(email, password):
        return None
    monkeypatch.setattr('controllers.auth.verify_user', mock_verify_user)
    response = client.post('/auth/login', json={"email": "a@b.com", "password": "wrong"})
    assert response.status_code == 401
    assert b"Wrong username/password" in response.data

def test_login_success(monkeypatch, client):
    class MockUser:
        id = 1
    def mock_verify_user(email, password):
        return MockUser()
    monkeypatch.setattr('controllers.auth.verify_user', mock_verify_user)
    response = client.post('/auth/login', json={"email": "a@b.com", "password": "123"})
    assert response.status_code == 200
    assert b"Login successful" in response.data
    assert b"token" in response.data
