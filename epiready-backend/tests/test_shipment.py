import pytest
from flask import Flask
from controllers.shipment import (
    create_shipment, get_shipment_by_name, get_all_shipments
)


def _q(obj):
    class Q:
        def get(self, _): return obj
        def filter_by(self, **kw): return self
        def all(self): return [obj] if obj else []
        def first(self): return obj
        def count(self): return 0
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
    from controllers import shipment as ship_ctrl
    import models.shipment as ship_m
    import models.user as user_m

    class _DB:
        @property
        def session(self): return _Sess()
    monkeypatch.setattr(ship_ctrl, "db", _DB(), raising=False)
    monkeypatch.setattr(ship_m,   "db", _DB(), raising=False)
    monkeypatch.setattr(user_m,   "db", _DB(), raising=False)

    # simple to_dict
    monkeypatch.setattr(ship_m.Shipment, "to_dict",
                        lambda self: {"id": "s1", "name": self.name if hasattr(self, 'name') else 'X'},
                        raising=False)

    # routes
    app.add_url_rule("/shipments",             view_func=create_shipment,       methods=["POST"])
    app.add_url_rule("/shipments/<name>",      view_func=get_shipment_by_name,  methods=["GET"])
    app.add_url_rule("/shipments/all",         view_func=get_all_shipments,     methods=["GET"])
    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_create_shipment_only_manufacturer(monkeypatch, client):
    import models.user as user_m
    class U: role="transporter"
    monkeypatch.setattr(user_m.User, "query", _q(U()), raising=False)
    r = client.post("/shipments", json={})
    assert r.status_code == 403


def test_create_shipment_missing_fields(monkeypatch, client):
    import models.user as user_m
    class U: role="manufacturer"
    monkeypatch.setattr(user_m.User, "query", _q(U()), raising=False)
    r = client.post("/shipments", json={})
    assert r.status_code == 400 and b"Missing fields" in r.data


def test_create_shipment_success(monkeypatch, client):
    import models.user as user_m, models.shipment as ship_m

    class U:
        role = "manufacturer"
        organization_id = 1

    dummy_user = U()

    monkeypatch.setattr(user_m.User, "query", _q(dummy_user), raising=False)
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)

    r = client.post("/shipments", json={
        'name':'Box','product_type':'A','origin':'x','destination':'y',
        'min_temp':1,'max_temp':5,'humidity_sensitivity':'low','aqi_sensitivity':'low',
        'transit_time_hrs':1,'risk_factor':1,'mode_of_transport':'air','status':'created',
        "organization_id": dummy_user.organization_id
    })

    assert r.status_code == 201 and b"Box" in r.data



# ──────────────── get_weather_data tests
def test_get_weather_not_found(monkeypatch, client):
    import controllers.shipment as ship_ctrl
    import models.user as user_m, models.shipment as ship_m, models.weather as weather_m
    class U:
        id = 1
        role = "manufacturer"
    monkeypatch.setattr(user_m.User, "query", _q(U()), raising=False)
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)
    # Simulate token_required by passing user_id=1
    with client.application.test_request_context():
        r = ship_ctrl.get_weather_data(shipment_id="s1")
        assert r[1] == 404 and b"Shipment not found" in r[0].data


    class U:
        id = 1
        role = "manufacturer"
    class S:
        id = "s1"
        user_id = 2  # Not equal to injected user_id=1
    class W:
        def to_dict(self): return {}
    monkeypatch.setattr(user_m.User, "query", _q(U()), raising=False)
    monkeypatch.setattr(ship_m.Shipment, "query", _q(S()), raising=False)
    monkeypatch.setattr(weather_m.WeatherData, "query", _q(W()), raising=False)
    with client.application.test_request_context():
        r = ship_ctrl.get_weather_data(shipment_id="s1")
        assert r[1] == 403 and b"Access denied" in r[0].data

def test_get_shipment_by_name_not_found(monkeypatch, client):
    import controllers.shipment as ship_ctrl
    import models.user as user_m, models.shipment as ship_m, models.weather as weather_m

    class U:
        id = 1
        role = "manufacturer"
        organization_id = 1

    class S:
        id = "s1"
        user_id = 1
        organization_id = 1

    class W:
        def to_dict(self):
            return {
                "internal_temperature": 5,
                "external_temperature": 10,
                "humidity": 50,
                "timestamp": "2024-01-01T00:00:00"
            }

    dummy_user    = U()
    dummy_ship    = S()
    dummy_weather = W()

    monkeypatch.setattr(user_m.User, "query", _q(dummy_user), raising=False)
    monkeypatch.setattr(ship_m.Shipment, "query", _q(dummy_ship), raising=False)
    monkeypatch.setattr(weather_m.WeatherData, "query", _q(dummy_weather), raising=False)

    with client.application.test_request_context():
        r = ship_ctrl.get_weather_data(shipment_id="s1")
        assert r[1] == 200 and b"internal" in r[0].data and b"humidity" in r[0].data

    monkeypatch.setattr(user_m.User, "query", _q(dummy_user), raising=False)
    monkeypatch.setattr(ship_m.Shipment, "query", _q(None), raising=False)

    r = client.get("/shipments/none")
    assert r.status_code == 404

def test_get_shipment_by_name_success(monkeypatch, client):
    import models.user as user_m, models.shipment as ship_m
    from controllers import shipment as ship_ctrl
    class U:
        id = 1
        role = "manufacturer"
        def to_dict(self):
            return {"id": 1, "email": "u@mail.com", "role": "manufacturer"}

    class S:
        name = "Box"
        user_id = 1
        def to_dict(self):
            return {"id": "s1", "name": "Box", "status": "created"}
    monkeypatch.setattr(user_m.User, "query", _q(U()), raising=False)
    monkeypatch.setattr(ship_ctrl.User, "query", _q(U()), raising=False)
    monkeypatch.setattr(ship_m.Shipment, "query", _q(S()), raising=False)
    r = client.get("/shipments/Box")
    assert r.status_code == 200 and b"Box" in r.data
