from flask import request, jsonify
from models.shipment import Shipment  # Assuming your model is in models/shipment.py
from config.database import db
from datetime import datetime, timezone
import uuid
from auth.auth import token_required

@token_required
def create_shipment(user_id):
    
    """
    POST /shipments

    Creates a new shipment.

    Possible Error Responses:
    - 400 Bad Request: "Missing fields {field names}"
    - 401 Unauthorized: "Session token was invalid."
    """
    
    data = request.get_json()
    required_fields = [
        'product_type', 'origin', 'destination',
        'required_temp_range', 'humidity_sensitivity', 'aqi_sensitivity',
        'transit_time_hrs', 'risk_factor', 'mode_of_transport', 'status'
    ]
    
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        shipment = Shipment(
            id=str(uuid.uuid4()),
            user_id=user_id,
            product_type=data['product_type'],
            origin=data['origin'],
            destination=data['destination'],
            required_temp_range=data['required_temp_range'],
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
    
# def get_shipment_by_id(shipment_id):
#     try:
#         shipment = Shipment.query.get(shipment_id)
#         if not shipment:
#             return jsonify({'error': 'Shipment not found'}), 404
#         return jsonify(shipment.to_dict()), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500