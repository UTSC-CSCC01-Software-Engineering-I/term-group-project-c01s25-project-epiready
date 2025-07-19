from flask import Blueprint
from controllers.alerts import get_alerts_for_user, get_alert_by_id, update_alert_status, get_action_logs_for_alert, get_shipment_alerts, update_alert_active

alerts_blueprint = Blueprint('alerts', __name__)
alerts_blueprint.route('', methods=['GET'])(get_alerts_for_user)
alerts_blueprint.route('/<int:alert_id>', methods=['GET'])(get_alert_by_id)
alerts_blueprint.route('/<int:alert_id>/status', methods=['PATCH'])(update_alert_status)
alerts_blueprint.route('/<int:alert_id>/actions', methods=['GET'])(get_action_logs_for_alert)
alerts_blueprint.route('/shipment/<shipment_id>', methods=['GET'])(get_shipment_alerts)
alerts_blueprint.route('/<int:alert_id>/active', methods=['PATCH'])(update_alert_active)