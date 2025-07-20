import pytest
from flask import Flask


# ───────────────────────────────── helpers
def _q(obj):
    class Q:
        def get(self, _): return obj
        def filter_by(self, **kw): return self
        def all(self): return [obj] if obj else []
        def first(self): return obj
    return Q()


class _Sess:
    def add(self, o): pass
    def commit(self): pass
    def rollback(self): pass


# ───────────────────────────────── fixture
@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = "secret"
    app.config["TESTING"] = True

    from controllers import user as user_ctrl
    import models.user as user_m
    import models.organization as org_m

    class _DB:
        @property
        def session(self): return _Sess()
    monkeypatch.setattr(user_ctrl, "db", _DB(), raising=False)
    monkeypatch.setattr(user_m,    "db", _DB(), raising=False)
    monkeypatch.setattr(org_m,     "db", _DB(), raising=False)

    # to_dict helpers
    monkeypatch.setattr(user_m.User, "to_dict",
                        lambda self: {"id": 1, "email": "u@mail.com", "role": getattr(self, "role", "manufacturer")},
                        raising=False)
    monkeypatch.setattr(org_m.Organization, "to_dict",
                        lambda self: {"id": 1, "name": "Org", "join_code": "CODE"},
                        raising=False)

    # wrapper so route accepts <role>
    def _wrap_get_users_by_role(*args, **kw):
        kw.pop("role", None)
        return user_ctrl.get_users_by_role(*args, **kw)

    app.add_url_rule("/users",              view_func=user_ctrl.get_user,              methods=["POST"])
    app.add_url_rule("/users/all",          view_func=user_ctrl.get_all_users,         methods=["GET"])
    app.add_url_rule("/users/role/<role>",  view_func=_wrap_get_users_by_role,         methods=["GET"])
    app.add_url_rule("/users/organization", view_func=user_ctrl.get_organization_by_id, methods=["GET"])

    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


# ───────────────────────────────── tests
def test_get_user_not_found(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    monkeypatch.setattr(user_m.User, "query", _q(None), raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", _q(None), raising=False)
    r = client.post("/users")
    assert r.status_code == 404


def test_get_user_success(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    class U:
        id = 1
        role = "manufacturer"
        def to_dict(self):
            return {"id": 1, "email": "u@mail.com", "role": "manufacturer"}
    monkeypatch.setattr(user_m.User, "query", _q(U()), raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", _q(U()), raising=False)
    r = client.post("/users")
    assert r.status_code == 200 and b'u@mail.com' in r.data


def test_get_users_by_role_access_denied(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    class Curr: role="manufacturer"
    monkeypatch.setattr(user_m.User, "query", _q(Curr()), raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", _q(Curr()), raising=False)
    r = client.get("/users/role/manufacturer")
    assert r.status_code == 403


def test_get_users_by_role_invalid(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    class Curr: role="transporter_manager"
    monkeypatch.setattr(user_m.User, "query", _q(Curr()), raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", _q(Curr()), raising=False)
    r = client.get("/users/role/invalid")
    assert r.status_code == 400 and b"Invalid role" in r.data


def test_get_users_by_role_success(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    class Curr: role="transporter_manager"
    class Target:
        def to_dict(self): return {"id": 2, "email": "t@mail.com", "role": "manufacturer"}
    q = _q(Curr())
    q.filter_by = lambda **kw: type("X", (), {"all": staticmethod(lambda: [Target()])})()
    monkeypatch.setattr(user_m.User, "query", q, raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", q, raising=False)
    r = client.get("/users/role/manufacturer")
    assert r.status_code == 200 and b"t@mail.com" in r.data


def test_get_all_users_access_denied(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    class Curr: role="manufacturer"
    monkeypatch.setattr(user_m.User, "query", _q(Curr()), raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", _q(Curr()), raising=False)
    r = client.get("/users/all")
    assert r.status_code == 403


def test_get_all_users_success(monkeypatch, client):
    import controllers.user as u_ctrl
    import models.user as user_m
    class Curr: role="transporter_manager"
    class T:
        def to_dict(self): return {"id": 2, "email": "list@mail.com", "role": "transporter"}
    q = _q(Curr())
    q.all = lambda: [T()]
    monkeypatch.setattr(user_m.User, "query", q, raising=False)
    monkeypatch.setattr(u_ctrl.User, "query", q, raising=False)
    r = client.get("/users/all")
    assert r.status_code == 200 and b"list@mail.com" in r.data
