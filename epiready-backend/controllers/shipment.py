from flask import request, jsonify, current_app
from models.shipment import Shipment  # Assuming your model is in models/shipment.py
from models.user import User
from config.database import db
from datetime import datetime, timezone
from models.weather import WeatherData
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
            organization_id=user.organization_id,
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

    Get all shipments related to the user based on their role.

    Query Parameters:
    - page: Page number for pagination (optional, default is 1)

    Possible Error Responses:
    - 401 Unauthorized: "Session token was invalid."
    """

    page = request.args.get('page', 1, type=int)
    per_page = 15
    try:
        user = User.query.get(user_id)

        if user.role == 'transporter_manager':
            base_query = Shipment.query.filter_by(organization_id=user.organization_id)
        else:
            base_query = Shipment.query.filter_by(user_id=user_id)
        
        total_count = base_query.count()
        shipments = base_query.order_by(Shipment.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        return jsonify({
            'shipments': [shipment.to_dict() for shipment in shipments],
            'total_count': total_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@token_required
def get_all_shipments(user_id):
    """
    GET /shipments/all

    Get all shipments in the organization. Only accessible by transporter managers.

    Possible Error Responses:
    - 403 Forbidden: "Access denied. Only transporter managers can view all shipments."
    - 401 Unauthorized: "Session token was invalid."
    """
    
    user = User.query.get(user_id)
    if user.role != 'transporter_manager':
        return jsonify({'error': 'Access denied. Only transporter managers can view all shipments.'}), 403
    
    try:
        shipments = Shipment.query.filter_by(organization_id=user.organization_id).all()
        return jsonify([shipment.to_dict() for shipment in shipments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@token_required
def get_shipment_by_name(user_id, name):
    """
    GET /shipments/<name>

    Get a specific shipment by name.
    - Regular users: Can only access their own shipments
    - Transporter managers: Can access any shipment in the organization

    Possible Error Responses:
    - 404 Not Found: "Shipment not found"
    - 401 Unauthorized: "Session token was invalid."
    """
    
    user = User.query.get(user_id)
    
    try:
        if user.role == 'transporter_manager':
            shipment = Shipment.query.filter_by(name=name, organization_id=user.organization_id).first()
        else:
            shipment = Shipment.query.filter_by(name=name, user_id=user_id).first()
            
        if not shipment:
            return jsonify({'error': 'Shipment not found'}), 404
        return jsonify(shipment.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@token_required
def get_weather_data(user_id, shipment_id):
    """
    GET /shipments/<shipment_id>/weather
    Fetch weather data for a specific user and shipment.
    - Only allows access if the shipment belongs to the user or user is transporter_manager.
    - Returns 404 if shipment not found.
    - Returns 403 if user does not have access.
    - Returns all weather data under 'all', with temperature and humidity grouped as specified.
    """
    # Validate shipment exists
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404
    # Validate user access
    user = User.query.get(user_id)
    if user.role != 'transporter_manager' and shipment.user_id != user_id:
        return jsonify({'error': 'Access denied. You can only view weather data for your own shipments.'}), 403
    elif shipment.organization_id != user.organization_id:
        return jsonify({'error': 'Access denied. You can only view weather data for shipments in your own organization.'}), 403
    try:
        weather_data = WeatherData.query.filter_by(shipment_id=shipment_id, user_id=shipment.user_id).order_by(WeatherData.id.desc()).limit(70).all()
        temp_data = []
        humidity_data = []
        for w in weather_data:
            w_dict = w.to_dict() if hasattr(w, 'to_dict') else dict(w)
            # Group temperature and humidity as requested
            temp_entry = {
                'internal': w_dict.get('internal_temp') if 'internal_temp' in w_dict else w_dict.get('temperature'),
                'external': w_dict.get('external_temp'),
                'timestamp': w_dict.get('timestamp')
            }
            temp_data.append(temp_entry)
            humidity_entry = {
                'humidity': w_dict.get('humidity'),
                'timestamp': w_dict.get('timestamp')
            }
            humidity_data.append(humidity_entry)
        return jsonify({'all': [w.to_dict() for w in weather_data], 'humidity': humidity_data, 'temperature': temp_data}), 200
    except Exception as e:
        import traceback
        print("[get_weather_data] Exception:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    
@token_required
def get_latest_weather_data(user_id, shipment_id):
    """
    GET /shipments/<shipment_id>/weather/latest
    Fetch the latest weather data for a specific user and shipment.
    - Only allows access if the shipment belongs to the user or user is transporter_manager.
    - Returns 404 if shipment not found.
    - Returns 403 if user does not have access.
    """
    # Validate shipment exists
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404
    # Validate user access
    user = User.query.get(user_id)
    if user.role != 'transporter_manager' and shipment.user_id != user_id:
        return jsonify({'error': 'Access denied. You can only view weather data for your own shipments.'}), 403
    elif shipment.organization_id != user.organization_id:
        return jsonify({'error': 'Access denied. You can only view weather data for shipments in your own organization.'}), 403
    try:
        weather_data = WeatherData.query.filter_by(shipment_id=shipment_id, user_id=shipment.user_id).order_by(WeatherData.id.desc()).first()
        if not weather_data:
            return jsonify({'id': '-', 'temperature': '-', 'humidity': '-', 'timestamp': '-', 'location': '-', 'aqi': '-'}), 200
        return jsonify(weather_data.to_dict()), 200
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

@token_required
def update_shipment_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 401
    
    data = request.get_json()
    shipment_id = data.get("shipment_id")
    
    if not data or 'status' not in data:
        return jsonify({'error': 'Missing required field: status'}), 400

    status = data['status'].lower()
    if status not in ['active', 'completed', 'cancelled']:
        return jsonify({'error': 'Invalid status'}), 400
    
    print(status, shipment_id)

    if user.role == 'transporter_manager':
        shipment = Shipment.query.filter_by(id=shipment_id, organization_id=user.organization_id).first()
    else:
        shipment = Shipment.query.filter_by(id=shipment_id, user_id=user_id).first()

    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404

    shipment.status = status
    shipment.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify(shipment.to_dict()), 200