import pytest
from flask import Flask
from controllers.shipment_action import (
    create_shipment_action,
    get_shipment_actions,
    get_action_by_id,
    update_action_status,
)

def _q(obj):
    class Q:
        def filter(self, *a, **k): return self
        def filter_by(self, **k):   return self
        def order_by(self, *a, **k): return self
        def all(self):  return [obj] if obj else []
        def first(self): return obj
        def get(self, _): return obj
    return Q()

class _Sess:
    def add(self, o): pass
    def commit(self): pass
    def rollback(self): pass

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = "secret"
    app.config["TESTING"] = True

    from controllers import shipment_action as act_ctrl
    import models.shipment_action as act_m
    import models.shipment as ship_m
    import models.user as user_m

    class _DB:
        @property
        def session(self): return _Sess()

    for m in (act_ctrl, act_m, ship_m, user_m):
        monkeypatch.setattr(m, "db", _DB(), raising=False)

    monkeypatch.setattr(
        act_m.ShipmentAction,
        "to_dict",
        lambda self: {
            "id": getattr(self, "id", "a1"),
            "shipment_id": getattr(self, "shipment_id", "s1"),
            "user_id": getattr(self, "user_id", 1),
            "action_type": getattr(self, "action_type", "status_update"),
            "status": getattr(self, "status", "active"),
        },
        raising=False,
    )

    app.add_url_rule("/actions",                      view_func=create_shipment_action, methods=["POST"])
    app.add_url_rule("/actions",                      view_func=get_shipment_actions,   methods=["GET"])
    app.add_url_rule("/actions/<int:action_id>",      view_func=get_action_by_id,       methods=["GET"])
    app.add_url_rule("/actions/<int:action_id>",      view_func=update_action_status,   methods=["PATCH"])

    with app.app_context():
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_create_action_missing_shipment_id(client):
    r = client.post("/actions", json={"action_type": "status_update"})
    assert r.status_code == 400 and b"Shipment ID is required" in r.data

def test_create_action_shipment_not_found(monkeypatch, client):
    import models.shipment as ship_m
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)
    r = client.post("/actions", json={"shipment_id": "s1", "action_type": "x"})
    assert r.status_code == 404 and b"Shipment not found" in r.data

def test_create_action_access_denied(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m
    class S: user_id = 2; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    monkeypatch.setattr(ship_m.Shipment, "query", _q(S()), raising=False)
    monkeypatch.setattr(user_m.User,    "query", _q(U()), raising=False)
    r = client.post("/actions", json={"shipment_id": "s1", "action_type": "x"})
    assert r.status_code == 403 and b"Access denied" in r.data

def test_create_action_missing_fields(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    for m, obj in ((ship_m.Shipment, S()), (user_m.User, U())):
        monkeypatch.setattr(m, "query", _q(obj), raising=False)
    r = client.post("/actions", json={"shipment_id": "s1"})
    assert r.status_code == 400 and b"Missing fields" in r.data

def test_create_action_success(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    for m, obj in ((ship_m.Shipment, S()), (user_m.User, U())):
        monkeypatch.setattr(m, "query", _q(obj), raising=False)
    r = client.post("/actions", json={
        "shipment_id": "s1", "action_type": "status_update", "description": "d"
    })
    assert r.status_code == 201 and b"status_update" in r.data

def test_get_actions_shipment_not_found(monkeypatch, client):
    import models.shipment as ship_m
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)
    r = client.get("/actions?shipment_id=s1")
    assert r.status_code == 404

def test_get_actions_success(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m, models.shipment_action as act_m
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    class A:
        def to_dict(self): return {"id": "a1", "action_type": "status_update"}
    monkeypatch.setattr(ship_m.Shipment,       "query", _q(S()), raising=False)
    monkeypatch.setattr(user_m.User,           "query", _q(U()), raising=False)
    monkeypatch.setattr(act_m.ShipmentAction,  "query", _q(A()), raising=False)
    r = client.get("/actions?shipment_id=s1")
    assert r.status_code == 200 and b"status_update" in r.data

def test_get_action_by_id_not_found(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m, models.shipment_action as act_m
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    monkeypatch.setattr(ship_m.Shipment, "query", _q(S()), raising=False)
    monkeypatch.setattr(user_m.User,    "query", _q(U()), raising=False)
    class Q:
        def filter_by(self, **kw): return _q(None)
    monkeypatch.setattr(act_m.ShipmentAction, "query", Q(), raising=False)
    r = client.get("/actions/a1", json={"shipment_id": "s1"})
    assert r.status_code == 404

def test_get_action_by_id_success(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m, models.shipment_action as act_m
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    class A:
        def to_dict(self): return {"id": "a1", "action_type": "status_update"}
    for m, obj in ((ship_m.Shipment, S()), (user_m.User, U())):
        monkeypatch.setattr(m, "query", _q(obj), raising=False)
    class Q:
        def filter_by(self, **kw): return _q(A())
    monkeypatch.setattr(act_m.ShipmentAction, "query", Q(), raising=False)
    r = client.get("/actions/1", json={"shipment_id": "s1"})
    assert r.status_code == 200 and b"status_update" in r.data

def test_update_status_not_found(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m, models.shipment_action as act_m
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    for m, obj in ((ship_m.Shipment, S()), (user_m.User, U())):
        monkeypatch.setattr(m, "query", _q(obj), raising=False)
    class Q:
        def filter_by(self, **kw): return _q(None)
    monkeypatch.setattr(act_m.ShipmentAction, "query", Q(), raising=False)
    r = client.patch("/actions/a1", json={"shipment_id": "s1", "status": "completed"})
    assert r.status_code == 404

def test_update_status_success(monkeypatch, client):
    import models.shipment as ship_m, models.user as user_m, models.shipment_action as act_m
    from controllers import shipment_action as act_ctrl
    class S: user_id = 1; organization_id = 1
    class U: role = "manufacturer"; id = 1; organization_id = 1
    class A:
        status = "active"
        completed_at = None
        def to_dict(self):
            return {"id": "a1", "status": "completed"}
    for m, obj in ((ship_m.Shipment, S()), (user_m.User, U())):
        monkeypatch.setattr(m, "query", _q(obj), raising=False)
    monkeypatch.setattr(act_ctrl.Shipment, "query", _q(S()), raising=False)
    monkeypatch.setattr(act_ctrl.User,     "query", _q(U()), raising=False)
    class Q:
        def filter_by(self, **kw): return _q(A())
    monkeypatch.setattr(act_m.ShipmentAction,      "query", Q(), raising=False)
    monkeypatch.setattr(act_ctrl.ShipmentAction,   "query", Q(), raising=False)
    r = client.patch("/actions/1", json={"shipment_id": "s1", "status": "completed"})
    assert r.status_code == 200 and b"completed" in r.data
