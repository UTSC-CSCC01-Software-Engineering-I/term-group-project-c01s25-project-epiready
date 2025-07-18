from flask import request, jsonify
from models.shipment_action import ShipmentAction
from models.shipment import Shipment
from models.user import User
from config.database import db
from auth.auth import token_required
import uuid

@token_required
def create_shipment_action(user_id):
    """
    POST /actions
    
    Creates a new action for a specific shipment.
    
    Required fields:
    - action_type: Type of action (e.g., 'status_update', 'location_update', 'temperature_alert')
    - description: Description of the action
    
    Optional fields:
    - status: Action status (default: 'active')
    - action_metadata: Additional JSON data
    
    Possible Error Responses:
    - 400 Bad Request: "Missing fields {field names}"
    - 404 Not Found: "Shipment not found"
    - 403 Forbidden: "Access denied. You can only create actions for your own shipments."
    - 401 Unauthorized: "Session token was invalid."
    """

    data = request.get_json()
    shipment_id = data.get("shipment_id")
    if not shipment_id:
        return jsonify({'error': 'Shipment ID is required'}), 400
    
    # Check if shipment exists and user has access
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404
    
    user = User.query.get(user_id)
    if user.role != 'transporter_manager' and shipment.user_id != user_id:
        return jsonify({'error': 'Access denied. You can only create actions for your own shipments.'}), 403
    
    data = request.get_json()
    required_fields = ['action_type', 'description']
    
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400
    
    try:
        action = ShipmentAction(
            shipment_id=shipment_id,
            user_id=user_id,
            action_type=data['action_type'],
            description=data['description'],
            status=data.get('status', 'active'),
            action_metadata=data.get('action_metadata', {})
        )
        
        db.session.add(action)
        db.session.commit()
        
        return jsonify(action.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@token_required
def get_shipment_actions(user_id):
    """
    GET /actions
    
    Get all actions for a specific shipment.
    - Regular users: Can only access actions for their own shipments
    - Transporter managers: Can access actions for any shipment
    
    Possible Error Responses:
    - 404 Not Found: "Shipment not found"
    - 403 Forbidden: "Access denied. You can only view actions for your own shipments."
    - 401 Unauthorized: "Session token was invalid."
    """
    
    data = request.get_json()
    shipment_id = data.get("shipment_id")
    if not shipment_id:
        return jsonify({'error': 'Shipment ID is required'}), 400
    
    # Check if shipment exists
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404
    
    # Check access permissions
    user = User.query.get(user_id)
    if user.role != 'transporter_manager' and shipment.user_id != user_id:
        return jsonify({'error': 'Access denied. You can only view actions for your own shipments.'}), 403
    
    try:
        actions = ShipmentAction.query.filter_by(shipment_id=shipment_id).order_by(ShipmentAction.created_at.desc()).all()
        return jsonify([action.to_dict() for action in actions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def get_action_by_id(user_id, action_id):
    """
    GET /actions/<action_id>
    
    Get a specific action by ID.
    - Regular users: Can only access actions for their own shipments
    - Transporter managers: Can access actions for any shipment
    
    Possible Error Responses:
    - 404 Not Found: "Action not found"
    - 403 Forbidden: "Access denied. You can only view actions for your own shipments."
    - 401 Unauthorized: "Session token was invalid."
    """
    
    data = request.get_json()
    shipment_id = data.get("shipment_id")
    action_id = request.view_args.get('action_id')
    
    if not shipment_id or not action_id:
        return jsonify({'error': 'Shipment ID and Action ID are required'}), 400
    
    # Check if shipment exists
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404
    
    # Check access permissions
    user = User.query.get(user_id)
    if user.role != 'transporter_manager' and shipment.user_id != user_id:
        return jsonify({'error': 'Access denied. You can only view actions for your own shipments.'}), 403
    
    try:
        action = ShipmentAction.query.filter_by(id=action_id, shipment_id=shipment_id).first()
        if not action:
            return jsonify({'error': 'Action not found'}), 404
        
        return jsonify(action.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def update_action_status(user_id, action_id):
    """
    PATCH /actions/<action_id>
    
    Update the status of a specific action.
    - Regular users: Can only update actions for their own shipments
    - Transporter managers: Can update actions for any shipment
    
    Required fields:
    - status: New status for the action
    
    Possible Error Responses:
    - 404 Not Found: "Action not found"
    - 403 Forbidden: "Access denied. You can only update actions for your own shipments."
    - 401 Unauthorized: "Session token was invalid."
    """
    
    data = request.get_json()
    shipment_id = data.get("shipment_id")
    action_id = request.view_args.get('action_id')
    
    if not shipment_id or not action_id:
        return jsonify({'error': 'Shipment ID and Action ID are required'}), 400
    
    # Check if shipment exists
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404
    
    # Check access permissions
    user = User.query.get(user_id)
    if user.role != 'transporter_manager' and shipment.user_id != user_id:
        return jsonify({'error': 'Access denied. You can only update actions for your own shipments.'}), 403
    
    data = request.get_json()
    if 'status' not in data:
        return jsonify({'error': 'Status field is required'}), 400
    
    try:
        action = ShipmentAction.query.filter_by(id=action_id, shipment_id=shipment_id).first()
        if not action:
            return jsonify({'error': 'Action not found'}), 404
        
        action.status = data['status']
        if 'action_metadata' in data:
            action.action_metadata = data['action_metadata']
        
        db.session.commit()
        return jsonify(action.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@token_required
def get_user_action_history(auth_user_id, user_id):
    """
    GET /api/users/<user_id>/actions
    
    Get all actions for the authenticated user across all their shipments.
    - Regular users: Can only access their own actions
    - Transporter managers: Can access actions for any user
    
    Query Parameters:
    - action_type (optional): Filter actions by type
    - status (optional): Filter actions by status
    - limit (optional): Limit number of results (default: 50, max: 200)
    - offset (optional): Offset for pagination (default: 0)
    
    Possible Error Responses:
    - 403 Forbidden: "Access denied. You can only view your own actions."
    - 401 Unauthorized: "Session token was invalid."
    """
    
    request_user_id = request.view_args.get('user_id')

    # Only allow if requesting your own history or you're a manager
    auth_user = User.query.get(auth_user_id)
    if auth_user.role != "transporter_manager" and auth_user_id != user_id:
        return jsonify({"error": "Access denied. You can only view your own actions."}), 403

    
    try:
        action_type = request.args.get('action_type')
        status_filter = request.args.get('status')
        limit = min(int(request.args.get('limit', 50)), 200)
        offset = int(request.args.get('offset', 0))
        
        user_shipments = Shipment.query.filter_by(user_id=request_user_id).all()
        shipment_ids = [s.id for s in user_shipments]
        
        if not shipment_ids:
            return jsonify({
                'actions': [],
                'total_count': 0,
                'has_more': False
            }), 200
        
        query = ShipmentAction.query.filter(ShipmentAction.shipment_id.in_(shipment_ids))
        
        if action_type:
            query = query.filter(ShipmentAction.action_type == action_type)
        if status_filter:
            query = query.filter(ShipmentAction.status == status_filter)
        
        total_count = query.count()
        
        actions = query.order_by(ShipmentAction.created_at.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'actions': [action.to_dict() for action in actions],
            'total_count': total_count,
            'has_more': (offset + limit) < total_count,
            'limit': limit,
            'offset': offset
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 