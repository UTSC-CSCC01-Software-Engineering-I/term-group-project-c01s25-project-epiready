from datetime import datetime, timezone
from config.database import db

class TemperatureData(db.Model):
    __tablename__ = 'temperature_data'

    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.String(50), nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    # time when temp reading was taken in UTC (to have a standard globally)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    # location of where temperature reading was taken is optional
    location = db.Column(db.String(100))
    shipment_id = db.Column(db.String(50), db.ForeignKey("shipments.id"), nullable=False)
    
    def __repr__(self):
        return f'<TemperatureData {self.sensor_id} at {self.timestamp}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'sensor_id': self.sensor_id,
            'temperature': self.temperature,
            'timestamp': self.timestamp.isoformat(),
            'location': self.location,
            'shipment_id': self.shipment_id
        } 