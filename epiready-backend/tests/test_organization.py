import pytest
from flask import Flask
from controllers.user import create_organization, join_organization


def _query_returning(obj):
    class Q:
        def filter_by(self, **kwargs):
            return self
        def first(self):
            return obj
        def get(self, _id):
            return obj
    return Q()


class _DummySession:
    def add(self, obj): pass
    def commit(self): pass


@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    app.config["TESTING"] = True

    from controllers import user as user_ctrl

    _dummy_session = _DummySession()
    class _DBStub:
        def __call__(self, *a, **k):
            return self
        @property
        def session(self):
            return _dummy_session
    monkeypatch.setattr(user_ctrl, "db", _DBStub(), raising=False)

    # ensure Organization has to_dict for success path
    def _org_to_dict(self):
        return {
            'id': getattr(self, 'id', 1),
            'name': getattr(self, 'name', None),
            'join_code': getattr(self, 'join_code', None),
            'created_at': getattr(self, 'created_at', 'now'),
        }
    monkeypatch.setattr(user_ctrl.Organization, "to_dict", _org_to_dict, raising=False)

    app.add_url_rule('/users/create-organization', view_func=create_organization, methods=['POST'])
    app.add_url_rule('/users/join-organization', view_func=join_organization, methods=['POST'])
    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_create_organization_missing_fields(client):
    response = client.post('/users/create-organization', json={})
    assert response.status_code == 400
    assert b"Organization name and join code are required" in response.data


def test_create_organization_duplicate_name(monkeypatch, client):
    from controllers import user as user_ctrl
    class MockOrg:
        def __init__(self, name, join_code):
            self.name = name
            self.join_code = join_code
            self.id = 1
            self.created_at = 'now'
        def to_dict(self):
            return {'id': self.id, 'name': self.name, 'join_code': self.join_code, 'created_at': self.created_at}
    mock_org = MockOrg('Org1', 'CODE123')
    monkeypatch.setattr(user_ctrl.Organization, "query", _query_returning(mock_org), raising=False)
    response = client.post('/users/create-organization', json={'name': 'Org1', 'join_code': 'CODE456'})
    assert response.status_code == 400
    assert b"Organization name already exists" in response.data


def test_create_organization_duplicate_code(monkeypatch, client):
    from controllers import user as user_ctrl
    class MockOrg:
        def __init__(self, name, join_code):
            self.name = name
            self.join_code = join_code
            self.id = 1
            self.created_at = 'now'
        def to_dict(self):
            return {'id': self.id, 'name': self.name, 'join_code': self.join_code, 'created_at': self.created_at}
    mock_org = MockOrg('Org2', 'CODE123')
    class Q:
        def filter_by(self, **kwargs):
            if 'name' in kwargs:
                return type('R', (), {'first': staticmethod(lambda: None)})()
            if 'join_code' in kwargs:
                return type('R', (), {'first': staticmethod(lambda: mock_org)})()
            return self
    monkeypatch.setattr(user_ctrl.Organization, "query", Q(), raising=False)
    response = client.post('/users/create-organization', json={'name': 'Org2', 'join_code': 'CODE123'})
    assert response.status_code == 400
    assert b"Join code already exists" in response.data


def test_create_organization_success(monkeypatch, client):
    from controllers import user as user_ctrl
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: None)})()
    monkeypatch.setattr(user_ctrl.Organization, "query", Q(), raising=False)
    response = client.post('/users/create-organization', json={'name': 'Org1', 'join_code': 'CODE123'})
    assert response.status_code == 201
    assert b'Org1' in response.data
    assert b'CODE123' in response.data


def test_join_organization_missing_code(client):
    response = client.post('/users/join-organization', json={})
    assert response.status_code == 400
    assert b"Join code is required" in response.data


def test_join_organization_invalid_code(monkeypatch, client):
    from controllers import user as user_ctrl
    monkeypatch.setattr(user_ctrl.Organization, "query", _query_returning(None), raising=False)
    class MockUser: organization_id = None
    import models.user as user_model
    monkeypatch.setattr(user_model, "User", type("User", (), {"query": _query_returning(MockUser())}), raising=False)
    response = client.post('/users/join-organization', json={'join_code': 'BADCODE'})
    assert response.status_code == 404
    assert b"Invalid join code" in response.data


def test_join_organization_already_in_org(monkeypatch, client):
    from controllers import user as user_ctrl
    class MockOrg:
        id = 1
        def to_dict(self):
            return {'id': 1, 'name': 'Org1', 'join_code': 'CODE123', 'created_at': 'now'}
    monkeypatch.setattr(user_ctrl.Organization, "query", _query_returning(MockOrg()), raising=False)
    class MockUser: organization_id = 1
    import models.user as user_model
    monkeypatch.setattr(user_model, "User", type("User", (), {"query": _query_returning(MockUser())}), raising=False)
    response = client.post('/users/join-organization', json={'join_code': 'CODE123'})
    assert response.status_code == 400
    assert b"User already belongs to an organization" in response.data


def test_join_organization_success(monkeypatch, client):
    from controllers import user as user_ctrl
    class MockOrg:
        id = 1
        def to_dict(self):
            return {'id': 1, 'name': 'Org1', 'join_code': 'CODE123', 'created_at': 'now'}
    monkeypatch.setattr(user_ctrl.Organization, "query", _query_returning(MockOrg()), raising=False)
    class MockUser: organization_id = None
    import models.user as user_model
    monkeypatch.setattr(user_model, "User", type("User", (), {"query": _query_returning(MockUser())}), raising=False)
    response = client.post('/users/join-organization', json={'join_code': 'CODE123'})
    assert response.status_code == 200
    assert b"Joined organization successfully" in response.data 