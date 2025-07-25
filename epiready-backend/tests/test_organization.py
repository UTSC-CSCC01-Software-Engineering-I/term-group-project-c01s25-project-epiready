import pytest
from flask import Flask
from config.database import db
from controllers import user as user_ctrl
from models.user import User
from models.organization import Organization
from sqlalchemy import Table, Column, Integer
from uuid import uuid4
import pkgutil, importlib, models

@pytest.fixture
def app():
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        for _, modname, _ in pkgutil.iter_modules(models.__path__):
            importlib.import_module(f"models.{modname}")

        meta = db.Model.metadata
        if 'organization' not in meta.tables:
            Table('organization', meta, Column('id', Integer, primary_key=True))

        db.create_all()

        app.add_url_rule('/users/create-organization', view_func=user_ctrl.create_organization, methods=['POST'])
        app.add_url_rule('/users/join-organization',   view_func=user_ctrl.join_organization,   methods=['POST'])

        yield app

        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def create_user(app):
    def _create_user(role=None, org_id=None, email=None, pwd=None):
        with app.app_context():
            if email is None:
                email = f"{uuid4().hex}@test.local"
            if pwd is None:
                pwd = "hashed"
            u = User(role=role, organization_id=org_id, email=email, password_hash=pwd)
            db.session.add(u)
            db.session.commit()
            return u.id
    return _create_user

def test_create_organization_missing_fields(client, create_user):
    user_id = create_user()
    r = client.post(
        '/users/create-organization',
        json={},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 400
    assert b"Organization name and join code are required" in r.data

def test_create_organization_success(client, create_user):
    user_id = create_user()
    r = client.post(
        '/users/create-organization',
        json={'name': 'Org1', 'join_code': 'CODE123'},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 201
    assert b"Org1" in r.data
    assert b"CODE123" in r.data

def test_join_organization_invalid_code(client, create_user):
    user_id = create_user()
    r = client.post(
        '/users/join-organization',
        json={'join_code': 'INVALID'},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 404
    assert b"Invalid join code" in r.data

def test_join_organization_success(client, create_user, app):
    with app.app_context():
        org = Organization(name='TestOrg', join_code='JOIN123')
        db.session.add(org)
        db.session.commit()

    user_id = create_user()
    r = client.post(
        '/users/join-organization',
        json={'join_code': 'JOIN123'},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 200
    assert b"Joined organization successfully" in r.data

def test_join_organization_already_in_org(client, create_user, app):
    with app.app_context():
        org = Organization(name='OrgWithUser', join_code='USED123')
        db.session.add(org)
        db.session.commit()
        org_id = org.id

    user_id = create_user(org_id=org_id)
    r = client.post(
        '/users/join-organization',
        json={'join_code': 'USED123'},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 400
    assert b"User already belongs to an organization" in r.data

def test_create_organization_duplicate_name(client, create_user, app):
    with app.app_context():
        org = Organization(name='DuplicateOrg', join_code='X123')
        db.session.add(org)
        db.session.commit()

    user_id = create_user()
    r = client.post(
        '/users/create-organization',
        json={'name': 'DuplicateOrg', 'join_code': 'X456'},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 400
    assert b"Organization name already exists" in r.data

def test_create_organization_duplicate_code(client, create_user, app):
    with app.app_context():
        org = Organization(name='CodeOrg', join_code='DUPLICATE')
        db.session.add(org)
        db.session.commit()

    user_id = create_user()
    r = client.post(
        '/users/create-organization',
        json={'name': 'NewName', 'join_code': 'DUPLICATE'},
        headers={'Authorization': f'Bearer {user_id}'}
    )
    assert r.status_code == 400
    assert b"Join code already exists" in r.data
