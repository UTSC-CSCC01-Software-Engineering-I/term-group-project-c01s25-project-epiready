import pytest
from flask import Flask
from controllers.shipment_action import (
    create_shipment_action,
    get_shipment_actions,
    get_action_by_id,
    update_action_status,
)


def _query_returning(obj):
    class Q:
        def filter_by(self, **kwargs):
            return self
        def first(self):
            return obj
        def all(self):
            return [obj] if obj else []
        def get(self, _id):
            return obj
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

    from controllers import shipment_action as action_ctrl
    import models.shipment_action as action_model

    _dummy_session = _DummySession()
    class _DBStub:
        def __call__(self, *a, **k):
            return self
        @property
        def session(self):
            return _dummy_session
        def init_app(self, app): pass
    monkeypatch.setattr(action_ctrl, "db", _DBStub(), raising=False)
    monkeypatch.setattr(action_model, "db", _DBStub(), raising=False)

    def _action_to_dict(self):
        return {
            'id': getattr(self, 'id', 'a1'),
            'shipment_id': getattr(self, 'shipment_id', 's1'),
            'user_id': getattr(self, 'user_id', 1),
            'action_type': getattr(self, 'action_type', 'status_update'),
            'status': getattr(self, 'status', 'active'),
        }
    monkeypatch.setattr(action_model.ShipmentAction, "to_dict", _action_to_dict, raising=False)

    app.add_url_rule('/actions', endpoint='create_action', view_func=create_shipment_action, methods=['POST'])
    app.add_url_rule('/actions', endpoint='get_actions',    view_func=get_shipment_actions,   methods=['GET'])
    app.add_url_rule('/actions/<action_id>', view_func=get_action_by_id,    methods=['GET'])
    app.add_url_rule('/actions/<action_id>', view_func=update_action_status, methods=['PATCH'])

    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_create_shipment_action_missing_shipment_id(client):
    response = client.post('/actions', json={'action_type': 'status_update', 'description': 'desc'})
    assert response.status_code == 400
    assert b'Shipment ID is required' in response.data


def test_create_shipment_action_shipment_not_found(monkeypatch, client):
    import models.shipment as shipment_model
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(None), raising=False)
    response = client.post('/actions', json={'shipment_id': 's1', 'action_type': 'status_update', 'description': 'desc'})
    assert response.status_code == 404
    assert b'Shipment not found' in response.data


def test_create_shipment_action_access_denied(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 2
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    response = client.post('/actions', json={'shipment_id': 's1', 'action_type': 'status_update', 'description': 'desc'})
    assert response.status_code == 403
    assert b'Access denied' in response.data


def test_create_shipment_action_missing_fields(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    response = client.post('/actions', json={'shipment_id': 's1'})
    assert response.status_code == 400
    assert b'Missing fields' in response.data


def test_create_shipment_action_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    response = client.post('/actions', json={'shipment_id': 's1', 'action_type': 'status_update', 'description': 'desc'})
    assert response.status_code == 201
    assert b'status_update' in response.data


def test_get_shipment_actions_shipment_not_found(monkeypatch, client):
    import models.shipment as shipment_model
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(None), raising=False)
    response = client.get('/actions', json={'shipment_id': 's1'})
    assert response.status_code == 404
    assert b'Shipment not found' in response.data


def test_get_shipment_actions_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    class MockAction:
        def to_dict(self):
            return {
                'id': 'a1',
                'shipment_id': 's1',
                'user_id': 1,
                'action_type': 'status_update',
                'status': 'active',
            }

    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)

    # full query chain stub
    class QA:
        def filter_by(self, **kwargs):
            return self
        def order_by(self, *args, **kwargs):
            return self
        def all(self):
            return [MockAction()]

    import models.shipment_action as action_model
    monkeypatch.setattr(action_model.ShipmentAction, "query", QA(), raising=False)

    import controllers.shipment_action as action_ctrl
    monkeypatch.setattr(action_ctrl.ShipmentAction, "query", QA(), raising=False)

    response = client.get('/actions', json={'shipment_id': 's1'})
    assert response.status_code == 200
    assert b'status_update' in response.data




def test_get_action_by_id_not_found(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    import models.shipment_action as action_model
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: None)})()
    monkeypatch.setattr(action_model.ShipmentAction, "query", Q(), raising=False)
    response = client.get('/actions/a2', json={'shipment_id': 's1'})
    assert response.status_code == 404
    assert b'Action not found' in response.data


def test_get_action_by_id_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    import models.shipment_action as action_model
    class MockAction:
        def to_dict(self):
            return {'id': 'a1', 'shipment_id': 's1', 'user_id': 1, 'action_type': 'status_update', 'status': 'active'}
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: MockAction())})()
    monkeypatch.setattr(action_model.ShipmentAction, "query", Q(), raising=False)
    response = client.get('/actions/a1', json={'shipment_id': 's1'})
    assert response.status_code == 200
    assert b'status_update' in response.data


def test_update_action_status_not_found(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    import models.shipment_action as action_model
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: None)})()
    monkeypatch.setattr(action_model.ShipmentAction, "query", Q(), raising=False)
    response = client.patch('/actions/a2', json={'shipment_id': 's1', 'status': 'completed'})
    assert response.status_code == 404
    assert b'Action not found' in response.data


def test_update_action_status_success(monkeypatch, client):
    import models.shipment as shipment_model
    import models.user as user_model
    class MockShipment: user_id = 1
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    import models.shipment_action as action_model
    class MockAction:
        status = 'active'
        completed_at = None
        def to_dict(self):
            return {'id': 'a1', 'shipment_id': 's1', 'user_id': 1, 'action_type': 'status_update', 'status': 'completed'}
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: MockAction())})()
    monkeypatch.setattr(action_model.ShipmentAction, "query", Q(), raising=False)
    response = client.patch('/actions/a1', json={'shipment_id': 's1', 'status': 'completed'})
    assert response.status_code == 200
    assert b'completed' in response.data
