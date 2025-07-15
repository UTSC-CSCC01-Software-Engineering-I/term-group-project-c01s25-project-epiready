from flask import Blueprint
from controllers.shipment_action import (
    create_shipment_action, 
    get_shipment_actions, 
    get_action_by_id, 
    update_action_status
)

shipment_action_blueprint = Blueprint("shipment_action", __name__)

shipment_action_blueprint.route("/actions", methods=["POST"])(create_shipment_action)
shipment_action_blueprint.route("/actions", methods=["GET"])(get_shipment_actions)
shipment_action_blueprint.route("/actions/<int:action_id>", methods=["GET"])(get_action_by_id)
shipment_action_blueprint.route("/actions/<int:action_id>", methods=["PATCH"])(update_action_status) 