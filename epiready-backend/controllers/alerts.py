import random
from datetime import datetime, timezone
from models.shipment import Shipment
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
                if low_temp is not None and high_temp is not None:
                    if not (low_temp <= internal_temp <= high_temp):
                        breach = True
                        breach_type = "Temperature"

                if humidity > humidity_limit:
                    breach = True
                    
                    if breach:
                        breach_type = "Humidity and Temperature"
                    else:
                        breach_type = "Humidity"

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
                
                print(f"Event data sent to User with ID {shipment.user_id}: ", data)

            eventlet.sleep(10)