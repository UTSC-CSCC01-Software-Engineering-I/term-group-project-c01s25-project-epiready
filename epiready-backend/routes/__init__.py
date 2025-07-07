from .auth import auth_blueprint
from .user import user_blueprint
from .shipment import shipment_blueprint
from .shipment_action import shipment_action_blueprint

all_blueprints = [
    (auth_blueprint, "/api/auth"),
    (user_blueprint, "/api/users"),
    (shipment_blueprint, "/api/shipments"),
    (shipment_action_blueprint, "/api/shipments")
]