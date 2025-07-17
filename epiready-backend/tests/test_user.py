import pytest
from flask import Flask


def _query_returning(obj):
    class Q:
        def filter_by(self, **kwargs): return self
        def first(self): return obj
        def all(self): return [obj] if obj else []
        def get(self, _id): return obj
    return Q()


class _DummySession:
    def add(self, obj): pass
    def commit(self): pass
    def rollback(self): pass


@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    app.config["TESTING"] = True

    # Import controller & models *inside* fixture so we bind fresh definitions
    from controllers import user as user_ctrl
    import models.user as user_model
    import models.organization as org_model

    _dummy_session = _DummySession()

    class _DBStub:
        def __call__(self, *a, **k): return self
        @property
        def session(self): return _dummy_session
        def init_app(self, app): pass

    monkeypatch.setattr(user_ctrl, "db", _DBStub(), raising=False)
    monkeypatch.setattr(user_model, "db", _DBStub(), raising=False)
    monkeypatch.setattr(org_model,  "db", _DBStub(), raising=False)

    # ensure to_dict implementations so controller JSONifies cleanly
    def _user_to_dict(self):
        return {
            'id': getattr(self, 'id', 1),
            'email': getattr(self, 'email', 'user@example.com'),
            'role': getattr(self, 'role', 'manufacturer'),
        }
    monkeypatch.setattr(user_model.User, "to_dict", _user_to_dict, raising=False)

    def _org_to_dict(self):
        return {
            'id': getattr(self, 'id', 1),
            'name': getattr(self, 'name', 'Org1'),
            'join_code': getattr(self, 'join_code', 'CODE123'),
            'created_at': getattr(self, 'created_at', 'now'),
        }
    monkeypatch.setattr(org_model.Organization, "to_dict", _org_to_dict, raising=False)

    # ---- wrapper to absorb <role> kwarg if controller sig lacks it ----
    def _wrapped_get_users_by_role(*args, **kwargs):
        kwargs.pop('role', None)  # silence unexpected kw
        return user_ctrl.get_users_by_role(*args, **kwargs)

    # Register routes
    app.add_url_rule('/users',                view_func=user_ctrl.get_user,              methods=['POST'])
    app.add_url_rule('/users/all',            view_func=user_ctrl.get_all_users,         methods=['GET'])
    app.add_url_rule('/users/role/<role>',    view_func=_wrapped_get_users_by_role,      methods=['GET'])
    app.add_url_rule('/users/organization',   view_func=user_ctrl.get_organization_by_id, methods=['GET'])

    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_get_user_not_found(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl
    monkeypatch.setattr(user_model.User, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", _query_returning(None), raising=False)
    r = client.post('/users')
    assert r.status_code == 404
    assert b'User not found' in r.data


def test_get_user_success(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl
    class MockUser:
        def to_dict(self):
            return {'id': 1, 'email': 'user@example.com', 'role': 'manufacturer'}
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", _query_returning(MockUser()), raising=False)
    r = client.post('/users')
    assert r.status_code == 200
    assert b'user@example.com' in r.data


def test_get_users_by_role_access_denied(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl

    class MockCurrentUser: role = 'manufacturer'
    class Q:
        def get(self, _id): return MockCurrentUser()
        def filter_by(self, **k): return self
        def all(self): return []
        def first(self): return MockCurrentUser()

    monkeypatch.setattr(user_model.User, "query", Q(), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", Q(), raising=False)

    r = client.get('/users/role/manufacturer')
    assert r.status_code == 403
    assert b'Only transporter managers can view users by role' in r.data


def test_get_users_by_role_invalid_role(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl

    class MockCurrentUser: role = 'transporter_manager'
    class Q:
        def get(self, _id): return MockCurrentUser()
        def filter_by(self, **k): return self
        def all(self): return []
        def first(self): return MockCurrentUser()

    monkeypatch.setattr(user_model.User, "query", Q(), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", Q(), raising=False)

    r = client.get('/users/role/invalid')
    assert r.status_code == 400
    assert b'Invalid role' in r.data


def test_get_users_by_role_success(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl

    class MockCurrentUser: role = 'transporter_manager'
    class MockTargetUser:
        def to_dict(self):
            return {'id': 2, 'email': 'target@example.com', 'role': 'manufacturer'}

    class Q:
        def get(self, _id): return MockCurrentUser()  # permission check
        def filter_by(self, **k): return self
        def all(self): return [MockTargetUser()]
        def first(self): return MockCurrentUser()

    monkeypatch.setattr(user_model.User, "query", Q(), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", Q(), raising=False)

    r = client.get('/users/role/manufacturer')
    assert r.status_code == 200
    assert b'target@example.com' in r.data


def test_get_all_users_access_denied(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl

    class MockCurrentUser: role = 'manufacturer'
    class Q:
        def get(self, _id): return MockCurrentUser()
        def all(self): return []
        def filter_by(self, **k): return self
        def first(self): return MockCurrentUser()

    monkeypatch.setattr(user_model.User, "query", Q(), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", Q(), raising=False)

    r = client.get('/users/all')
    assert r.status_code == 403
    assert b'Only transporter managers can view all users' in r.data


def test_get_all_users_success(monkeypatch, client):
    import models.user as user_model
    import controllers.user as user_ctrl

    class MockCurrentUser: role = 'transporter_manager'
    class MockTargetUser:
        def to_dict(self):
            return {'id': 2, 'email': 'target@example.com', 'role': 'manufacturer'}

    class Q:
        def get(self, _id): return MockCurrentUser()
        def all(self): return [MockTargetUser()]
        def filter_by(self, **k): return self
        def first(self): return MockCurrentUser()

    monkeypatch.setattr(user_model.User, "query", Q(), raising=False)
    monkeypatch.setattr(user_ctrl.User,   "query", Q(), raising=False)

    r = client.get('/users/all')
    assert r.status_code == 200
    assert b'target@example.com' in r.data


def test_get_organization_by_id_missing_id(client):
    r = client.get('/users/organization', json={})
    assert r.status_code == 400
    assert b'Organization id is required' in r.data


def test_get_organization_by_id_not_found(monkeypatch, client):
    import models.organization as org_model
    import controllers.user as user_ctrl
    monkeypatch.setattr(org_model.Organization, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(user_ctrl.Organization, "query", _query_returning(None), raising=False)
    r = client.get('/users/organization', json={'id': 99})
    assert r.status_code == 404
    assert b'Organization not found' in r.data


def test_get_organization_by_id_success(monkeypatch, client):
    import models.organization as org_model
    import controllers.user as user_ctrl
    class MockOrg:
        def to_dict(self):
            return {'id': 1, 'name': 'Org1', 'join_code': 'CODE123', 'created_at': 'now'}
    monkeypatch.setattr(org_model.Organization, "query", _query_returning(MockOrg()), raising=False)
    monkeypatch.setattr(user_ctrl.Organization, "query", _query_returning(MockOrg()), raising=False)
    r = client.get('/users/organization', json={'id': 1})
    assert r.status_code == 200
    assert b'Org1' in r.data
