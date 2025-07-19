from flask import Blueprint
from controllers.shipment_action import (
    create_shipment_action, 
    create_shipment_action_by_id,
    get_shipment_actions, 
    get_shipment_actions_by_id,
    get_action_by_id, 
    update_action_status
)

shipment_action_blueprint = Blueprint("shipment_action", __name__)

shipment_action_blueprint.route("/actions", methods=["POST"])(create_shipment_action)
shipment_action_blueprint.route("/actions", methods=["GET"])(get_shipment_actions)
shipment_action_blueprint.route("/actions/<int:action_id>", methods=["GET"])(get_action_by_id)
shipment_action_blueprint.route("/actions/<int:action_id>", methods=["PATCH"])(update_action_status) 

# Routes with shipment_id in URL
shipment_action_blueprint.route("/<string:shipment_id>/actions", methods=["POST"])(create_shipment_action_by_id)
shipment_action_blueprint.route("/<string:shipment_id>/actions", methods=["GET"])(get_shipment_actions_by_id)