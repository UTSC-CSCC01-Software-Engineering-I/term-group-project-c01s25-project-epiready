import pytest
from flask import Flask
from controllers.alerts import (
    get_alerts_for_user,
    get_alert_by_id,
    update_alert_status,
    get_action_logs_for_alert,
    get_shipment_alerts,
)


# ────────────────────────── helper stubs
def _q(obj):
    """Chain‑able fake SQLAlchemy query returning *obj*."""
    class Q:
        def filter(self, *a, **k):   return self
        def filter_by(self, **k):     return self
        def order_by(self, *a, **k):  return self
        def all(self):   return [obj] if obj else []
        def first(self): return obj
        def get(self, _): return obj
        def count(self): return 0
    return Q()


class _Sess:
    def add(self, o): pass
    def commit(self): pass
    def rollback(self): pass


# ────────────────────────── Flask test app
@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.secret_key = "secret"
    app.config["TESTING"] = True

    from controllers import alerts as a_ctrl
    import models.alert as alert_m

    class _DB:
        @property
        def session(self): return _Sess()

    # patch db into controller & model
    monkeypatch.setattr(a_ctrl,  "db", _DB(), raising=False)
    monkeypatch.setattr(alert_m, "db", _DB(), raising=False)

    # generic to_dict helpers
    monkeypatch.setattr(
        alert_m.Alert,
        "to_dict",
        lambda self: {
            "id": 1,
            "shipment_id": 1,
            "status": getattr(self, "status", "active"),
            "type": "temp",
            "severity": "low",
            "message": "msg",
        },
        raising=False,
    )
    monkeypatch.setattr(
        alert_m.ActionLog,
        "to_dict",
        lambda self: {"id": 1, "alert_id": 1, "action": "acknowledged"},
        raising=False,
    )

    # correct routes (alert_id / shipment_id)
    app.add_url_rule("/alerts",                       view_func=get_alerts_for_user,      methods=["GET"])
    app.add_url_rule("/alerts/<int:alert_id>",        view_func=get_alert_by_id,          methods=["GET"])
    app.add_url_rule("/alerts/<int:alert_id>/status", view_func=update_alert_status,      methods=["PATCH"])
    app.add_url_rule("/alerts/<int:alert_id>/logs",   view_func=get_action_logs_for_alert, methods=["GET"])
    app.add_url_rule("/shipments/<int:shipment_id>/alerts",
                     view_func=get_shipment_alerts,   methods=["GET"])

    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


# ────────────────────────── tests
def test_get_alerts_empty(monkeypatch, client):
    import models.shipment as ship_m, controllers.alerts as a_ctrl
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)
    monkeypatch.setattr(a_ctrl.Shipment, "query", _q(None), raising=False)
    r = client.get("/alerts")
    assert r.status_code == 200 and b'"alerts":[]' in r.data


def test_get_alerts_success(monkeypatch, client):
    import models.shipment as ship_m, models.alert as alert_m, controllers.alerts as a_ctrl
    class S: id = 1; user_id = 1
    class Al:
        def to_dict(self): return {"id":1,"shipment_id":1,"type":"temp","status":"active"}
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    for mod in (alert_m, a_ctrl):
        monkeypatch.setattr(mod.Alert, "query", _q(Al()), raising=False)
    r = client.get("/alerts")
    assert r.status_code == 200 and b"temp" in r.data


def test_get_alert_by_id_not_found(monkeypatch, client):
    import models.alert as alert_m, models.shipment as ship_m, controllers.alerts as a_ctrl
    class S: id=1; user_id=1
    monkeypatch.setattr(alert_m.Alert, "query", _q(None), raising=False)
    monkeypatch.setattr(a_ctrl.Alert,   "query", _q(None), raising=False)
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    r = client.get("/alerts/99")
    assert r.status_code == 404


def test_get_alert_by_id_success(monkeypatch, client):
    import models.alert as alert_m, models.shipment as ship_m, controllers.alerts as a_ctrl
    class S: id = 1; user_id = 1
    class A:
        shipment_id = 1
        def to_dict(self):
            return {"id": 1, "shipment_id": 1, "status": "active", "type": "temp"}
    for mod in (alert_m, a_ctrl):
        monkeypatch.setattr(mod.Alert, "query", _q(A()), raising=False)
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    r = client.get("/alerts/1")
    assert r.status_code == 200 and b"temp" in r.data


def test_update_status_not_found(monkeypatch, client):
    import models.alert as alert_m, models.shipment as ship_m, controllers.alerts as a_ctrl
    class S: id=1; user_id=1
    monkeypatch.setattr(alert_m.Alert, "query", _q(None), raising=False)
    monkeypatch.setattr(a_ctrl.Alert,   "query", _q(None), raising=False)
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    r = client.patch("/alerts/99/status", json={"status":"resolved"})
    assert r.status_code == 404


def test_update_status_success(monkeypatch, client):
    import models.alert as alert_m, models.shipment as ship_m, controllers.alerts as a_ctrl
    class S: id=1; user_id=1
    class A:
        id = 1
        shipment_id = 1
        status = "active"
        resolved_at = None
        def to_dict(self):
            return {"id": 1, "shipment_id": 1, "status": "resolved"}
    for mod in (alert_m, a_ctrl):
        monkeypatch.setattr(mod.Alert, "query", _q(A()), raising=False)
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    r = client.patch("/alerts/1/status", json={"status":"resolved"})
    assert r.status_code == 200 and b"resolved" in r.data


def test_action_logs_empty(monkeypatch, client):
    import models.alert as alert_m, models.shipment as ship_m, controllers.alerts as a_ctrl
    class S: id=1; user_id=1
    class A: shipment_id=1
    for mod in (alert_m, a_ctrl):
        monkeypatch.setattr(mod.Alert, "query", _q(A()), raising=False)
    monkeypatch.setattr(alert_m.ActionLog, "query", _q(None), raising=False)
    monkeypatch.setattr(a_ctrl.ActionLog,  "query", _q(None), raising=False)
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    r = client.get("/alerts/1/logs")
    assert r.status_code == 200 and b'[]' in r.data


def test_action_logs_success(monkeypatch, client):
    import models.alert as alert_m, models.shipment as ship_m, controllers.alerts as a_ctrl
    class S: id = 1; user_id = 1
    class A: shipment_id = 1
    class L:
        def to_dict(self): return {"id": 1, "alert_id": 1, "action": "acknowledged"}
    for mod in (alert_m, a_ctrl):
        monkeypatch.setattr(mod.Alert, "query", _q(A()), raising=False)
    monkeypatch.setattr(alert_m.ActionLog, "query", _q(L()), raising=False)
    monkeypatch.setattr(a_ctrl.ActionLog,  "query", _q(L()), raising=False)
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    r = client.get("/alerts/1/logs")
    assert r.status_code == 200 and b"acknowledged" in r.data


def test_get_shipment_alerts_not_found(monkeypatch, client):
    import models.shipment as ship_m, models.alert as alert_m, controllers.alerts as a_ctrl
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)
    monkeypatch.setattr(alert_m.Alert,   "query", _q(None), raising=False)
    monkeypatch.setattr(a_ctrl.Shipment, "query", _q(None), raising=False)
    monkeypatch.setattr(a_ctrl.Alert,    "query", _q(None), raising=False)
    r = client.get("/shipments/99/alerts")
    assert r.status_code == 404


def test_get_shipment_alerts_success(monkeypatch, client):
    import models.shipment as ship_m, models.alert as alert_m, controllers.alerts as a_ctrl
    class S: id=1; user_id=1
    class Al:
        def to_dict(self): return {"id":1,"type":"temp","status":"active"}
    for mod in (ship_m, a_ctrl):
        monkeypatch.setattr(mod.Shipment, "query", _q(S()), raising=False)
    for mod in (alert_m, a_ctrl):
        monkeypatch.setattr(mod.Alert, "query", _q(Al()), raising=False)
    r = client.get("/shipments/1/alerts")
    assert r.status_code == 200 and b"temp" in r.data
