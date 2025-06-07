from datetime import datetime, timezone
from config.database import db

class WeatherData(db.Model):
    __tablename__ = 'weather_data'

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    # optionally description of weather conditions, and humidity, wind speed if available
    conditions = db.Column(db.String(50))
    humidity = db.Column(db.Float)
    wind_speed = db.Column(db.Float)
    # time when weather data was recorded in UTC (to have a standard globally)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f'<WeatherData {self.location} at {self.timestamp}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'location': self.location,
            'temperature': self.temperature,
            'conditions': self.conditions,
            'humidity': self.humidity,
            'wind_speed': self.wind_speed,
            'timestamp': self.timestamp.isoformat()
        } 