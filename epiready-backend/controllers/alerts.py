import random
from datetime import datetime, timezone
from flask import request, jsonify
from models.shipment import Shipment
from models.alert import Alert, ActionLog
from config.database import db
from auth.auth import token_required
import eventlet

def parse_temp_range(temp_range):
    """Parses a string like '2 to 8' into (2.0, 8.0)."""
    try:
        low, high = map(float, temp_range.split('to'))
        return low, high
    except Exception:
        return None, None

def humidity_threshold(level):
    """Defines arbitrary thresholds based on sensitivity."""
    return {
        'low': 80,
        'medium': 60,
        'high': 40
    }.get(level.lower(), 100) 

def create_alert(shipment_id, alert_type, severity, message):
    """Create and save an alert to the database"""
    try:
        alert = Alert(
            shipment_id=shipment_id,
            type=alert_type,
            severity=severity,
            message=message,
            status='active',
            active=True
        )
        db.session.add(alert)
        db.session.commit()
        return alert
    except Exception as e:
        db.session.rollback()
        print(f"Error creating alert: {e}")
        return None

def severity_rank(severity):
    ranks = {"low": 1, "medium": 2, "high": 3, "very high": 4}
    return ranks.get(severity, 0)

previous_alerts = {}

def start_temperature_monitor(socketio, app):
    with app.app_context():
        print("Starting")

        while True:
            internal_temp = round(random.uniform(2, 10), 2)
            external_temp = round(random.uniform(0, 35), 2)
            humidity = round(random.uniform(10, 85), 2)
            timestamp = datetime.now(timezone.utc).isoformat()
            
            print("query")

            shipments = Shipment.query.filter_by(status='active').all()
            
            print(shipments)

            for shipment in shipments:
                lat, lon = (None, None)
                if shipment.current_location:
                    try:
                        lat, lon = map(str.strip, shipment.current_location.split(','))
                    except:
                        pass

                low_temp = shipment.min_temp
                high_temp = shipment.max_temp
                humidity_limit = humidity_threshold(shipment.humidity_sensitivity)

                breach = False
                breach_type = ""
                alert_messages = []
                
                if low_temp is not None and high_temp is not None:
                    if not (low_temp <= internal_temp <= high_temp):
                        breach = True
                        breach_type = "Temperature"
                        alert_messages.append(f"Temperature breach: {internal_temp}°C (required: {low_temp}°C - {high_temp}°C)")

                if humidity > humidity_limit:
                    breach = True
                    humidity_msg = f"Humidity breach: {humidity}% (limit: {humidity_limit}%)"
                    alert_messages.append(humidity_msg)
                    
                    if breach_type:
                        breach_type = "Humidity and Temperature"
                    else:
                        breach_type = "Humidity"

                # Create alert in database if there's a breach
                if breach:
                    severity = "low"
                    
                    temp_deviation = 0
                    if "Temperature" in breach_type:
                        temp_deviation = max(
                            abs(internal_temp - low_temp) if internal_temp < low_temp else 0,
                            abs(internal_temp - high_temp) if internal_temp > high_temp else 0
                        )
                    
                    humidity_excess = 0
                    if "Humidity" in breach_type:
                        humidity_excess = humidity - humidity_limit
                    
                    if "Temperature" in breach_type:
                        if temp_deviation > 4:
                            severity = "very high"
                        elif temp_deviation > 2:
                            severity = "high"
                        elif temp_deviation > 0.5:
                            severity = "medium"
                    if "Humidity" in breach_type:
                        if humidity_excess > 25:
                            severity = "very high"
                        elif humidity_excess > 15 and severity != "very high":
                                severity = "high"
                        elif humidity_excess > 5 and severity != "very high" and severity != "high":
                            severity = "medium"
                    
                    alert_message = " | ".join(alert_messages)
                    prev = previous_alerts.get(shipment.id)
                    should_emit = False
                    if prev:
                        # Only emit if message is different and severity is worse
                        if (prev['breach'] == False or (alert_message != prev['message'] and severity_rank(severity) > severity_rank(prev['severity']))):
                            should_emit = True
                    else:
                        # No previous alert, always emit
                        should_emit = True

                    if should_emit:
                        alert_obj = create_alert(shipment.id, breach_type.lower().replace(" ", "_"), severity, alert_message)
                        print(f"Creating alert for shipment {shipment.id}: {alert_message} (severity: {severity}), previous: {prev} ")
                        socketio.emit(
                            'breach_alert',
                            {
                                'message': alert_message,
                                'severity': severity,
                                'shipment_id': shipment.id,
                                'shipment_name': getattr(shipment, 'name', None),
                                'id': getattr(alert_obj, 'id', None),
                                'timestamp': getattr(alert_obj, 'created_at', datetime.now(timezone.utc)).isoformat() if alert_obj else datetime.now(timezone.utc).isoformat()
                            },
                            room=str(shipment.user_id)
                        )
                    
                    previous_alerts[shipment.id] = {'message': alert_message, 'severity': severity, 'breach': True}
                
                else:
                    previous_alerts[shipment.id] = {'breach': False}

                data = {
                    'timestamp': timestamp,
                    'latitude': lat,
                    'longitude': lon,
                    'internal_temperature': internal_temp,
                    'external_temperature': external_temp,
                    'humidity': humidity,
                    'shipment_id': shipment.id,
                    'breach': breach,
                    'breach_type': breach_type
                }
                socketio.emit('temperature_alert', data, room=str(shipment.user_id))
                
                # print(f"Event data sent to User with ID {shipment.user_id}: ", data)

            eventlet.sleep(10)

@token_required
def get_alerts_for_user(user_id):
    """
    GET /api/alerts
    
    Get all alerts for the authenticated user.
    
    Query Parameters:
    - shipment_id (optional): Filter alerts by specific shipment
    - status (optional): Filter alerts by status (active, inprogress, resolved)
    - active (optional): Filter alerts by active status (true, false)
    - page (optional): Page number for pagination
    
    Possible Error Responses:
    - 401 Unauthorized: "Session token was invalid."
    """
    try:
        shipment_id = request.args.get('shipment_id')
        status_filter = request.args.get('status')
        active_filter = request.args.get('active', 'false').lower() == 'true'
        page = request.args.get('page', 1, type=int)
        
        # Get user's shipments
        user_shipments = Shipment.query.filter_by(user_id=user_id).all()
        shipment_ids = [s.id for s in user_shipments]
        
        if not shipment_ids:
            return jsonify({
                'alerts': [],
                'total_count': 0
            }), 200
        
        # Filter by specific shipment if provided
        if shipment_id and shipment_id in shipment_ids:
            base_query = Alert.query.filter_by(shipment_id=shipment_id)
        else:
            base_query = Alert.query.filter(Alert.shipment_id.in_(shipment_ids))

        # Get total count before pagination
        total_count = base_query.count()

        alerts = base_query.order_by(Alert.id.desc()).limit(25).offset((page - 1) * 25).all()

        # Add shipment name to each alert dict
        shipment_id_to_name = {s.id: s.name for s in user_shipments}
        alert_dicts = []
        for alert in alerts:
            alert_data = alert.to_dict()
            alert_data['shipment_name'] = shipment_id_to_name.get(alert.shipment_id, None)
            alert_dicts.append(alert_data)

        # Apply status filter if provided
        if status_filter:
            alert_dicts = [alert for alert in alert_dicts if alert['status'] == status_filter]
        if active_filter:
            alert_dicts = [alert for alert in alert_dicts if alert['active'] == True]

        return jsonify({
            'alerts': alert_dicts,
            'total_count': total_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def get_alert_by_id(user_id, alert_id):
    """
    GET /api/alerts/<alert_id>
    
    Get a specific alert by ID.
    
    Possible Error Responses:
    - 404 Not Found: "Alert not found"
    - 403 Forbidden: "Access denied. You can only view your own alerts."
    - 401 Unauthorized: "Session token was invalid."
    """
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        # Check if user owns the shipment associated with this alert
        shipment = Shipment.query.filter_by(id=alert.shipment_id, user_id=user_id).first()
        if not shipment:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        return jsonify(alert.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def update_alert_status(user_id, alert_id):
    """
    PATCH /api/alerts/<alert_id>/status
    
    Update the status of an alert.
    
    Required fields:
    - status: New status (active, inprogress, resolved)
    
    Possible Error Responses:
    - 400 Bad Request: "Status field is required"
    - 404 Not Found: "Alert not found"
    - 403 Forbidden: "Access denied. You can only update your own alerts."
    - 401 Unauthorized: "Session token was invalid."
    """
    try:
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'error': 'Status field is required'}), 400
        
        status = data['status']
        valid_statuses = ['active', 'inprogress', 'resolved']
        
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        # Check if user owns the shipment associated with this alert
        shipment = Shipment.query.filter_by(id=alert.shipment_id, user_id=user_id).first()
        if not shipment:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        old_status = alert.status
        alert.status = status
        
        # Create an action log when status changes
        if old_status != status:
            action_log = ActionLog(
                alert_id=alert.id,
                action_type=f"status_change_{status}",
                status='completed',
                details=f"Alert status changed from '{old_status}' to '{status}'"
            )
            db.session.add(action_log)
        
        db.session.commit()
        return jsonify(alert.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@token_required
def update_alert_active(user_id, alert_id):
    """
    PATCH /api/alerts/<alert_id>/active
    
    Update the active status of an alert.
    
    Required fields:
    - active: New active status (true, false)
    
    Possible Error Responses:
    - 400 Bad Request: "Active field is required"
    - 404 Not Found: "Alert not found"
    - 403 Forbidden: "Access denied. You can only update your own alerts."
    - 401 Unauthorized: "Session token was invalid."
    """
    try:
        data = request.get_json()
        
        if not data or 'active' not in data:
            return jsonify({'error': 'Active field is required'}), 400

        active = data['active']
        if not isinstance(active, bool):
            return jsonify({'error': 'Active field must be a boolean'}), 400

        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        # Check if user owns the shipment associated with this alert
        shipment = Shipment.query.filter_by(id=alert.shipment_id, user_id=user_id).first()
        if not shipment:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        old_active = alert.active
        alert.active = active

        db.session.commit()
        return jsonify(alert.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@token_required
def get_action_logs_for_alert(user_id, alert_id):
    """
    GET /api/alerts/<alert_id>/actions
    
    Get all action logs for a specific alert.
    
    Possible Error Responses:
    - 404 Not Found: "Alert not found"
    - 403 Forbidden: "Access denied. You can only view action logs for your own alerts."
    - 401 Unauthorized: "Session token was invalid."
    """
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        shipment = Shipment.query.filter_by(id=alert.shipment_id, user_id=user_id).first()
        if not shipment:
            return jsonify({'error': 'Alert not found or access denied'}), 404
        
        action_logs = ActionLog.query.filter_by(alert_id=alert_id).order_by(ActionLog.created_at.desc()).all()
        
        return jsonify({
            'action_logs': [log.to_dict() for log in action_logs],
            'alert_id': alert_id,
            'total_count': len(action_logs)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def get_shipment_alerts(user_id, shipment_id):
    """
    GET /api/alerts/shipment/<shipment_id>
    
    Get all alerts for a specific shipment.
    
    Query Parameters:
    - status (optional): Filter alerts by status (active, inprogress, resolved)
    
    Possible Error Responses:
    - 403 Forbidden: "Access denied. You can only view alerts for your own shipments."
    - 401 Unauthorized: "Session token was invalid."
    """
    try:
        status_filter = request.args.get('status')
        
        shipment = Shipment.query.filter_by(id=shipment_id, user_id=user_id).first()
        if not shipment:
            return jsonify({'error': 'Shipment not found or access denied'}), 404
        
        alerts = Alert.query.filter_by(shipment_id=shipment_id).order_by(Alert.created_at.desc()).all()
        alert_dicts = [alert.to_dict() for alert in alerts]
        
        if status_filter:
            alert_dicts = [alert for alert in alert_dicts if alert['status'] == status_filter]
        
        return jsonify({
            'alerts': alert_dicts,
            'shipment_id': shipment_id,
            'total_count': len(alert_dicts)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500