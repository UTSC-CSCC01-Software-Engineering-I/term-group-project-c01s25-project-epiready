from flask import Blueprint
from controllers.shipment import create_shipment, get_shipments_by_user, get_shipment_by_name, get_all_shipments, get_weather_data, set_transit_status

shipment_blueprint = Blueprint("shipment", __name__)
shipment_blueprint.route("", methods=["POST"])(create_shipment)
shipment_blueprint.route("", methods=["GET"])(get_shipments_by_user)
shipment_blueprint.route("/all", methods=["GET"])(get_all_shipments)
shipment_blueprint.route("/<name>", methods=["GET"])(get_shipment_by_name)
shipment_blueprint.route("/<string:shipment_id>/weather", methods=["GET"])(get_weather_data)
shipment_blueprint.route("/<string:shipment_id>/transit_status", methods=["POST"])(set_transit_status)