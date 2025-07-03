from flask import request, jsonify, current_app
from models.shipment import Shipment  # Assuming your model is in models/shipment.py
from models.user import User
from config.database import db
from datetime import datetime, timezone
import uuid
from auth.auth import token_required
import jwt

@token_required
def create_shipment(user_id):
    
    """
    POST /shipments

    Creates a new shipment. Only manufacturers can create shipments.

    Possible Error Responses:
    - 400 Bad Request: "Missing fields {field names}"
    - 400 Bad Request: "Shipment name already exists"
    - 403 Forbidden: "Only manufacturers can create shipments"
    - 401 Unauthorized: "Session token was invalid."
    """
    
    user = User.query.get(user_id)
    if user.role != 'manufacturer':
        return jsonify({'error': 'Only manufacturers can create shipments'}), 403
    
    data = request.get_json()
    required_fields = [
        'name', 'product_type', 'origin', 'destination',
        'min_temp', 'max_temp', 'humidity_sensitivity', 'aqi_sensitivity',
        'transit_time_hrs', 'risk_factor', 'mode_of_transport', 'status'
    ]
    
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Validate temperature range
    try:
        min_temp = float(data['min_temp'])
        max_temp = float(data['max_temp'])
        if min_temp >= max_temp:
            return jsonify({'error': 'min_temp must be less than max_temp'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'min_temp and max_temp must be valid numbers'}), 400

    existing_shipment = Shipment.query.filter_by(name=data['name']).first()
    if existing_shipment:
        return jsonify({'error': 'Shipment name already exists'}), 400

    try:
        shipment = Shipment(
            id=str(uuid.uuid4()),
            name=data['name'],
            user_id=user_id,
            product_type=data['product_type'],
            origin=data['origin'],
            destination=data['destination'],
            min_temp=min_temp,
            max_temp=max_temp,
            humidity_sensitivity=data['humidity_sensitivity'],
            aqi_sensitivity=data['aqi_sensitivity'],
            transit_time_hrs=data['transit_time_hrs'],
            risk_factor=data['risk_factor'],
            mode_of_transport=data['mode_of_transport'],
            status=data['status'],
            expected_arrival=datetime.fromisoformat(data['expected_arrival']) if data.get('expected_arrival') else None,
            current_location=data.get('current_location', None)
        )

        db.session.add(shipment)
        db.session.commit()

        return jsonify(shipment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@token_required
def get_shipments_by_user(user_id):
    
    """
    GET /shipments

    Get all shipments related to the user.

    Possible Error Responses:
    - 401 Unauthorized: "Session token was invalid."
    """
    
    try:
        shipments = Shipment.query.filter_by(user_id=user_id).all()
        return jsonify([shipment.to_dict() for shipment in shipments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def get_all_shipments(user_id):
    """
    GET /shipments/all

    Get all shipments in the system. Only accessible by transporter managers.

    Possible Error Responses:
    - 403 Forbidden: "Access denied. Only transporter managers can view all shipments."
    - 401 Unauthorized: "Session token was invalid."
    """
    
    user = User.query.get(user_id)
    if user.role != 'transporter_manager':
        return jsonify({'error': 'Access denied. Only transporter managers can view all shipments.'}), 403
    
    try:
        shipments = Shipment.query.all()
        return jsonify([shipment.to_dict() for shipment in shipments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@token_required
def get_shipment_by_name(user_id, name):
    """
    GET /shipments/<name>

    Get a specific shipment by name.
    - Regular users: Can only access their own shipments
    - Transporter managers: Can access any shipment

    Possible Error Responses:
    - 404 Not Found: "Shipment not found"
    - 401 Unauthorized: "Session token was invalid."
    """
    
    user = User.query.get(user_id)
    
    try:
        if user.role == 'transporter_manager':
            shipment = Shipment.query.filter_by(name=name).first()
        else:
            shipment = Shipment.query.filter_by(name=name, user_id=user_id).first()
            
        if not shipment:
            return jsonify({'error': 'Shipment not found'}), 404
        return jsonify(shipment.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# def get_shipment_by_id(shipment_id):
#     try:
#         shipment = Shipment.query.get(shipment_id)
#         if not shipment:
#             return jsonify({'error': 'Shipment not found'}), 404
#         return jsonify(shipment.to_dict()), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500