import pytest
from flask import Flask
from controllers.alerts import (
    get_alerts_for_user,
    get_alert_by_id,
    update_alert_status,
    get_action_logs_for_alert,
    get_shipment_alerts,
)


# ----------------------------------------------------------------------------------------------------------------------
# Generic light query stub (covers filter_by/order_by/first/all/get) -- good for simple paths.
def _query_returning(obj):
    class Q:
        def filter(self, *args, **kwargs): return self
        def filter_by(self, **kwargs): return self
        def order_by(self, *args, **kwargs): return self
        def all(self): return [obj] if obj else []
        def first(self): return obj
        def get(self, _id): return obj
        def count(self): return 1 if obj else 0
    return Q()


# User‑specific stub (shortcut; used rarely now but kept for backwards compat)
def _user_query_returning(user_obj):
    class Q:
        def get(self, _id): return user_obj
        def filter_by(self, **kwargs): return self
        def first(self): return user_obj
        def count(self): return 1
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

    from controllers import alerts as alerts_ctrl
    import models.alert as alert_model

    _dummy_session = _DummySession()

    class _DBStub:
        def __call__(self, *a, **k): return self
        @property
        def session(self): return _dummy_session
        def init_app(self, app): pass

    # patch db used by controller + model
    monkeypatch.setattr(alerts_ctrl, "db", _DBStub(), raising=False)
    monkeypatch.setattr(alert_model, "db", _DBStub(), raising=False)

    # guarantee to_dict implementations exist
    def _alert_to_dict(self):
        return {
            'id': getattr(self, 'id', 1),
            'shipment_id': getattr(self, 'shipment_id', 1),
            'type': getattr(self, 'type', 'temp'),
            'severity': getattr(self, 'severity', 'low'),
            'message': getattr(self, 'message', 'msg'),
            'status': getattr(self, 'status', 'active'),
        }
    monkeypatch.setattr(alert_model.Alert, "to_dict", _alert_to_dict, raising=False)

    def _actionlog_to_dict(self):
        return {
            'id': getattr(self, 'id', 1),
            'alert_id': getattr(self, 'alert_id', 1),
            'action': getattr(self, 'action', 'acknowledged'),
        }
    monkeypatch.setattr(alert_model.ActionLog, "to_dict", _actionlog_to_dict, raising=False)

    # register routes
    app.add_url_rule('/alerts', view_func=get_alerts_for_user, methods=['GET'])
    app.add_url_rule('/alerts/<int:alert_id>', view_func=get_alert_by_id, methods=['GET'])
    app.add_url_rule('/alerts/<int:alert_id>/status', view_func=update_alert_status, methods=['PATCH'])
    app.add_url_rule('/alerts/<int:alert_id>/logs', view_func=get_action_logs_for_alert, methods=['GET'])
    app.add_url_rule('/shipments/<int:shipment_id>/alerts', view_func=get_shipment_alerts, methods=['GET'])

    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


# ----------------------------------------------------------------------------------------------------------------------
# Tests
# ----------------------------------------------------------------------------------------------------------------------

def test_get_alerts_for_user_no_shipments(monkeypatch, client):
    import models.shipment as shipment_model
    import controllers.alerts as alerts_ctrl

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(alerts_ctrl.Shipment,      "query", _query_returning(None), raising=False)

    r = client.get('/alerts', query_string={})
    assert r.status_code == 200
    assert b'alerts' in r.data


def test_get_alerts_for_user_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.alert as alert_model
    import models.user as user_model
    import controllers.alerts as alerts_ctrl

    class MockShipment:
        id = 1
        user_id = 1

    class MockUser:
        id = 1
        role = 'transporter_manager'

    class MockAlert:
        id = 1
        shipment_id = 1
        type = 'temp'
        severity = 'low'
        message = 'msg'
        status = 'active'
        def to_dict(self):
            return {
                'id': 1, 'shipment_id': 1, 'type': 'temp',
                'severity': 'low', 'message': 'msg', 'status': 'active'
            }

    # chainable shipment/user/alert stubs
    class QS:
        def filter_by(self, **k): return self
        def all(self): return [MockShipment()]
        def get(self, _id): return MockShipment()
        def first(self): return MockShipment()
    class QU:
        def get(self, _id): return MockUser()
        def filter_by(self, **k): return self
        def first(self): return MockUser()
    class QA:
        def filter(self, *a, **k): return self
        def filter_by(self, **k): return self
        def order_by(self, *a, **k): return self
        def all(self): return [MockAlert()]
        def first(self): return MockAlert()
        def get(self, _id): return MockAlert()
        def count(self): return 1

    monkeypatch.setattr(shipment_model.Shipment, "query", QS(), raising=False)
    monkeypatch.setattr(alert_model.Alert,      "query", QA(), raising=False)
    monkeypatch.setattr(user_model.User,        "query", QU(), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", QS(), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", QA(), raising=False)
    monkeypatch.setattr(alerts_ctrl.User,     "query", QU(), raising=False)

    r = client.get('/alerts', query_string={})
    # print("DBG alerts_for_user_success:", r.status_code, r.data)
    assert r.status_code == 200
    assert b'temp' in r.data


def test_get_alert_by_id_not_found(monkeypatch, client):
    import models.shipment as shipment_model
    import models.alert as alert_model
    import controllers.alerts as alerts_ctrl

    class MockShipment: id = 1; user_id = 1

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alert_model.Alert,       "query", _query_returning(None), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", _query_returning(None), raising=False)

    r = client.get('/alerts/99', query_string={})
    assert r.status_code == 404
    assert b'Alert not found' in r.data or b'Alert not found or access denied' in r.data


def test_get_alert_by_id_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.alert as alert_model
    import controllers.alerts as alerts_ctrl

    class MockShipment: id = 1; user_id = 1
    class MockAlert:
        shipment_id = 1
        def to_dict(self):
            return {'id': 1, 'shipment_id': 1, 'type': 'temp', 'severity': 'low', 'message': 'msg', 'status': 'active'}

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alert_model.Alert,       "query", _query_returning(MockAlert()), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", _query_returning(MockAlert()), raising=False)

    r = client.get('/alerts/1', query_string={})
    assert r.status_code == 200
    assert b'temp' in r.data


def test_update_alert_status_not_found(monkeypatch, client):
    import models.shipment as shipment_model
    import models.alert as alert_model
    import controllers.alerts as alerts_ctrl

    class MockShipment: id = 1; user_id = 1

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alert_model.Alert,       "query", _query_returning(None), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", _query_returning(None), raising=False)

    r = client.patch('/alerts/99/status', json={'status': 'resolved'})
    assert r.status_code == 404
    assert b'Alert not found' in r.data or b'access denied' in r.data


def test_update_alert_status_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.alert as alert_model
    import controllers.alerts as alerts_ctrl

    class MockShipment: id = 1; user_id = 1
    class MockAlert:
        id = 1
        shipment_id = 1
        status = 'active'
        resolved_at = None
        def to_dict(self):
            return {'id': 1, 'shipment_id': 1, 'type': 'temp', 'severity': 'low', 'message': 'msg', 'status': 'resolved'}

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alert_model.Alert,       "query", _query_returning(MockAlert()), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", _query_returning(MockAlert()), raising=False)

    r = client.patch('/alerts/1/status', json={'status': 'resolved'})
    assert r.status_code == 200
    assert b'resolved' in r.data


def test_get_action_logs_for_alert_not_found(monkeypatch, client):
    import models.alert as alert_model
    import models.shipment as shipment_model
    import controllers.alerts as alerts_ctrl

    class MockAlert: id = 1; shipment_id = 1
    class MockShipment: id = 1; user_id = 1  # allow permission check to pass

    # empty action log list
    monkeypatch.setattr(alert_model.ActionLog, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(alert_model.Alert,     "query", _query_returning(MockAlert()), raising=False)
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)

    monkeypatch.setattr(alerts_ctrl.ActionLog, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,     "query", _query_returning(MockAlert()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Shipment,  "query", _query_returning(MockShipment()), raising=False)

    r = client.get('/alerts/1/logs', query_string={})
    assert r.status_code == 200
    assert b'[]' in r.data

def test_get_action_logs_for_alert_success(monkeypatch, client):
    import models.alert as alert_model
    import models.shipment as shipment_model
    import controllers.alerts as alerts_ctrl

    class MockAlert: id = 1; shipment_id = 1
    class MockShipment: id = 1; user_id = 1

    class MockLog:
        id = 1
        alert_id = 1
        action = 'acknowledged'
        def to_dict(self):
            return {'id': 1, 'alert_id': 1, 'action': 'acknowledged'}

    monkeypatch.setattr(alert_model.ActionLog, "query", _query_returning(MockLog()), raising=False)
    monkeypatch.setattr(alert_model.Alert,     "query", _query_returning(MockAlert()), raising=False)
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)

    monkeypatch.setattr(alerts_ctrl.ActionLog, "query", _query_returning(MockLog()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,     "query", _query_returning(MockAlert()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Shipment,  "query", _query_returning(MockShipment()), raising=False)

    r = client.get('/alerts/1/logs', query_string={})
    assert r.status_code == 200
    assert b'acknowledged' in r.data


def test_get_shipment_alerts_not_found(monkeypatch, client):
    import models.alert as alert_model
    import models.shipment as shipment_model
    import controllers.alerts as alerts_ctrl

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(alert_model.Alert,       "query", _query_returning(None), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", _query_returning(None), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", _query_returning(None), raising=False)

    r = client.get('/shipments/99/alerts', query_string={})
    assert r.status_code == 404
    assert b'Shipment not found' in r.data or b'access denied' in r.data.lower()


def test_get_shipment_alerts_success(monkeypatch, client):
    import models.alert as alert_model
    import models.shipment as shipment_model
    import controllers.alerts as alerts_ctrl

    class MockShipment: id = 1; user_id = 1
    class MockAlert:
        def to_dict(self):
            return {'id': 1, 'shipment_id': 1, 'type': 'temp', 'severity': 'low', 'message': 'msg', 'status': 'active'}

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alert_model.Alert,       "query", _query_returning(MockAlert()), raising=False)

    monkeypatch.setattr(alerts_ctrl.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(alerts_ctrl.Alert,    "query", _query_returning(MockAlert()), raising=False)

    r = client.get('/shipments/1/alerts', query_string={})
    assert r.status_code == 200
    assert b'temp' in r.data
