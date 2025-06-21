from flask import Blueprint
from controllers.shipment import create_shipment, get_shipments_by_user

shipment_blueprint = Blueprint("shipment", __name__)
shipment_blueprint.route("", methods=["POST"])(create_shipment)
shipment_blueprint.route("", methods=["GET"])(get_shipments_by_user)