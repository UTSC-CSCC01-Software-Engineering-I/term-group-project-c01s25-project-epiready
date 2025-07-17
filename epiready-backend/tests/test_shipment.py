import pytest
from flask import Flask
from controllers.shipment import create_shipment, get_shipments_by_user, get_all_shipments, get_shipment_by_name


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

    from controllers import shipment as shipment_ctrl
    import models.shipment as shipment_model
    import models.user as user_model

    _dummy_session = _DummySession()
    class _DBStub:
        def __call__(self, *a, **k):
            return self
        @property
        def session(self):
            return _dummy_session
    monkeypatch.setattr(shipment_ctrl, "db", _DBStub(), raising=False)
    monkeypatch.setattr(shipment_model, "db", _DBStub(), raising=False)

    # Mock Shipment.to_dict
    def _shipment_to_dict(self):
        return {
            'id': getattr(self, 'id', 'id1'),
            'name': getattr(self, 'name', 'Shipment1'),
            'user_id': getattr(self, 'user_id', 1),
            'status': getattr(self, 'status', 'active'),
        }
    monkeypatch.setattr(shipment_model.Shipment, "to_dict", _shipment_to_dict, raising=False)

    app.add_url_rule('/shipments', view_func=create_shipment, methods=['POST'])
    app.add_url_rule('/shipments', view_func=get_shipments_by_user, methods=['GET'])
    app.add_url_rule('/shipments/all', view_func=get_all_shipments, methods=['GET'])
    app.add_url_rule('/shipments/<name>', view_func=get_shipment_by_name, methods=['GET'])
    with app.app_context():
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_create_shipment_missing_fields(monkeypatch, client):
    import models.user as user_model
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    response = client.post('/shipments', json={})
    assert response.status_code == 400
    assert b"Missing fields" in response.data

def test_create_shipment_not_manufacturer(monkeypatch, client):
    import models.user as user_model
    class MockUser: role = 'transporter'
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    response = client.post('/shipments', json={'name': 'S1'})
    assert response.status_code == 403
    assert b"Only manufacturers can create shipments" in response.data

def test_create_shipment_duplicate_name(monkeypatch, client):
    import models.user as user_model
    import models.shipment as shipment_model
    class MockUser: role = 'manufacturer'
    class MockShipment: pass
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    data = {'name': 'S1', 'product_type': 'P', 'origin': 'O', 'destination': 'D', 'min_temp': 1, 'max_temp': 2, 'humidity_sensitivity': 'low', 'aqi_sensitivity': 'low', 'transit_time_hrs': 1, 'risk_factor': 1, 'mode_of_transport': 'road', 'status': 'active'}
    response = client.post('/shipments', json=data)
    assert response.status_code == 400
    assert b"Shipment name already exists" in response.data

def test_create_shipment_success(monkeypatch, client):
    import models.user as user_model
    import models.shipment as shipment_model
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: None)})()
    monkeypatch.setattr(shipment_model.Shipment, "query", Q(), raising=False)
    data = {'name': 'S1', 'product_type': 'P', 'origin': 'O', 'destination': 'D', 'min_temp': 1, 'max_temp': 2, 'humidity_sensitivity': 'low', 'aqi_sensitivity': 'low', 'transit_time_hrs': 1, 'risk_factor': 1, 'mode_of_transport': 'road', 'status': 'active'}
    response = client.post('/shipments', json=data)
    assert response.status_code == 201
    assert b'S1' in response.data

def test_get_shipments_by_user(monkeypatch, client):
    import models.shipment as shipment_model
    class MockShipment:
        def to_dict(self):
            return {'id': 'id1', 'name': 'Shipment1', 'user_id': 1, 'status': 'active'}
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    response = client.get('/shipments')
    assert response.status_code == 200
    assert b'Shipment1' in response.data

def test_get_all_shipments_not_manager(monkeypatch, client):
    import models.user as user_model
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    response = client.get('/shipments/all')
    assert response.status_code == 403
    assert b"Only transporter managers can view all shipments" in response.data

def test_get_all_shipments_success(monkeypatch, client):
    import models.user as user_model
    import models.shipment as shipment_model
    class MockUser: role = 'transporter_manager'
    class MockShipment:
        def to_dict(self):
            return {'id': 'id1', 'name': 'Shipment1', 'user_id': 1, 'status': 'active'}
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    monkeypatch.setattr(shipment_model.Shipment, "query", _query_returning(MockShipment()), raising=False)
    response = client.get('/shipments/all')
    assert response.status_code == 200
    assert b'Shipment1' in response.data

def test_get_shipment_by_name_not_found(monkeypatch, client):
    import models.user as user_model
    import models.shipment as shipment_model
    class MockUser: role = 'manufacturer'
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: None)})()
    monkeypatch.setattr(shipment_model.Shipment, "query", Q(), raising=False)
    response = client.get('/shipments/NotExist')
    assert response.status_code == 404
    assert b'Shipment not found' in response.data

def test_get_shipment_by_name_success(monkeypatch, client):
    import models.user as user_model
    import models.shipment as shipment_model
    class MockUser: role = 'transporter_manager'
    class MockShipment:
        def to_dict(self):
            return {'id': 'id1', 'name': 'Shipment1', 'user_id': 1, 'status': 'active'}
    class Q:
        def filter_by(self, **kwargs):
            return type('R', (), {'first': staticmethod(lambda: MockShipment())})()
    monkeypatch.setattr(user_model.User, "query", _query_returning(MockUser()), raising=False)
    monkeypatch.setattr(shipment_model.Shipment, "query", Q(), raising=False)
    response = client.get('/shipments/Shipment1')
    assert response.status_code == 200
    assert b'Shipment1' in response.data 