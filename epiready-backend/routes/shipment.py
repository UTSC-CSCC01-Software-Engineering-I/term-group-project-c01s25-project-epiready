from flask import Blueprint
from controllers.shipment import create_shipment

shipment_blueprint = Blueprint("shipment", __name__)
shipment_blueprint.route("/create", methods=["POST"])(create_shipment)