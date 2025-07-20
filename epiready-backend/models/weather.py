from datetime import datetime, timezone
from config.database import db

class WeatherData(db.Model):
    __tablename__ = 'weather_data'

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=True)
    internal_temp = db.Column(db.Float, nullable=True)
    external_temp = db.Column(db.Float, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Optional link to User
    shipment_id = db.Column(db.String(50), db.ForeignKey('shipments.id'), nullable=True)  # Optional link to Shipment
    # optionally description of weather conditions, and humidity, wind speed if available
    humidity = db.Column(db.Float)
    aqi = db.Column(db.Float)
    # time when weather data was recorded in UTC (to have a standard globally)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f'<WeatherData {self.location} at {self.timestamp}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'location': self.location,
            'internal_temp': self.internal_temp,
            'external_temp': self.external_temp,
            'humidity': self.humidity,
            'user_id': self.user_id,
            'shipment_id': self.shipment_id,
            'aqi': self.aqi,
            'timestamp': self.timestamp.isoformat()
        } 