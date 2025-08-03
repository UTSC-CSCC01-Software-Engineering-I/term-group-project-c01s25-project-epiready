import pytest
from flask import Flask

class DummySession:
    def __init__(self, current=None):
        self.current = current
    def get(self, model, pk):
        return self.current
    def add(self, obj): pass
    def commit(self): pass
    def rollback(self): pass

class DummyDB:
    def __init__(self, current=None):
        self.session = DummySession(current)

def _q(obj):
    class Q:
        def get(self, _): return obj
        def filter_by(self, **kw): return self
        def all(self): return [obj] if obj else []
        def first(self): return obj
    return Q()

AUTH = {"Authorization": "Bearer 1"}

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = "secret"
    app.config["TESTING"] = True

    from controllers import user as user_ctrl
    import models.user as user_m
    import models.organization as org_m

    db_stub = DummyDB()
    for mod in (user_ctrl, user_m, org_m):
        monkeypatch.setattr(mod, "db", db_stub, raising=False)

    monkeypatch.setattr(
        user_m.User,
        "to_dict",
        lambda self: {
            "id": getattr(self, "id", 1),
            "email": getattr(self, "email", "x@mail.com"),
            "role": getattr(self, "role", "manufacturer")
        },
        raising=False,
    )
    monkeypatch.setattr(
        org_m.Organization,
        "to_dict",
        lambda self: {"id": getattr(self, "id", 1), "name": "Org"},
        raising=False,
    )

    def _role_route(role):
        return user_ctrl.get_users_by_role()

    app.add_url_rule("/users",             view_func=user_ctrl.get_user,          methods=["POST"])
    app.add_url_rule("/users/all",         view_func=user_ctrl.get_all_users,      methods=["GET"])
    app.add_url_rule("/users/role/<role>", view_func=_role_route,                  methods=["GET"])

    with app.app_context():
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_user_not_found(monkeypatch, client):
    from controllers import user as user_ctrl
    user_ctrl.db.session = DummySession(current=None)
    r = client.post("/users", headers=AUTH)
    assert r.status_code == 404

def test_get_user_success(monkeypatch, client):
    from controllers import user as user_ctrl
    class U:
        id = 1
        email = "u@mail.com"
        role = "manufacturer"
        organization_id = 1
        def to_dict(self): return {"id": 1, "email": "u@mail.com", "role": "manufacturer"}
    user_ctrl.db.session = DummySession(current=U())
    r = client.post("/users", headers=AUTH)
    assert r.status_code == 200 and b"u@mail.com" in r.data

def test_get_users_by_role_access_denied(monkeypatch, client):
    from controllers import user as user_ctrl
    class Curr: role = "manufacturer"; organization_id = 1
    user_ctrl.db.session = DummySession(current=Curr())
    r = client.get("/users/role/manufacturer", headers=AUTH)
    assert r.status_code == 403

def test_get_users_by_role_invalid(monkeypatch, client):
    from controllers import user as user_ctrl
    class Curr: role = "transporter_manager"; organization_id = 1
    user_ctrl.db.session = DummySession(current=Curr())
    r = client.get("/users/role/invalid", headers=AUTH)
    assert r.status_code == 400 and b"Invalid role" in r.data

def test_get_users_by_role_success(monkeypatch, client):
    from controllers import user as user_ctrl
    import models.user as user_m
    class Curr: role = "transporter_manager"; organization_id = 1
    class Target:
        def to_dict(self): return {"id": 2, "email": "t@mail.com", "role": "manufacturer"}

    user_ctrl.db.session = DummySession(current=Curr())

    q = _q(Curr())
    q.filter_by = lambda **kw: type("X", (), {"all": staticmethod(lambda: [Target()])})()
    monkeypatch.setattr(user_m.User, "query", q, raising=False)

    r = client.get("/users/role/manufacturer", headers=AUTH)
    assert r.status_code == 200 and b"t@mail.com" in r.data

def test_get_all_users_access_denied(monkeypatch, client):
    from controllers import user as user_ctrl
    class Curr: role = "manufacturer"; organization_id = 1
    user_ctrl.db.session = DummySession(current=Curr())
    r = client.get("/users/all", headers=AUTH)
    assert r.status_code == 403

def test_get_all_users_success(monkeypatch, client):
    from controllers import user as user_ctrl
    import models.user as user_m
    class Curr: role = "transporter_manager"; organization_id = 1
    class T:
        def to_dict(self): return {"id": 2, "email": "list@mail.com", "role": "transporter"}

    user_ctrl.db.session = DummySession(current=Curr())

    q = _q(Curr())
    q.filter_by = lambda **kw: type("X", (), {"all": staticmethod(lambda: [T()])})()
    monkeypatch.setattr(user_m.User, "query", q, raising=False)

    r = client.get("/users/all", headers=AUTH)
    assert r.status_code == 200 and b"list@mail.com" in r.data
