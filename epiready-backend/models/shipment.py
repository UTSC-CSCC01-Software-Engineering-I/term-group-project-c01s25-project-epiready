from datetime import datetime, timezone
from config.database import db
from sqlalchemy import event

class Shipment(db.Model):
    __tablename__ = 'shipments'

    id = db.Column(db.String(50), primary_key=True)  # Shipment ID
    name = db.Column(db.String(100), unique=True, nullable=False)  # Unique shipment name
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Link to User
    product_type = db.Column(db.String(100), nullable=False)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    min_temp = db.Column(db.Float, nullable=False)  # Minimum temperature in Celsius
    max_temp = db.Column(db.Float, nullable=False)  # Maximum temperature in Celsius
    humidity_sensitivity = db.Column(db.String(20), nullable=False) # low, medium, high
    aqi_sensitivity = db.Column(db.String(20), nullable=False) # low, medium, high
    transit_time_hrs = db.Column(db.Integer, nullable=False)
    risk_factor = db.Column(db.String(50), nullable=False)
    mode_of_transport = db.Column(db.String(50), nullable=False)

    status = db.Column(db.String(20), nullable=False)  # active, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=lambda *_: datetime.now(timezone.utc))
    expected_arrival = db.Column(db.DateTime, nullable=True)
    actual_arrival = db.Column(db.DateTime)
    current_location = db.Column(db.String(100))

    def __repr__(self):
        return f'<Shipment {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'product_type': self.product_type,
            'origin': self.origin,
            'destination': self.destination,
            'min_temp': self.min_temp,
            'max_temp': self.max_temp,
            'humidity_sensitivity': self.humidity_sensitivity,
            'aqi_sensitivity': self.aqi_sensitivity,
            'transit_time_hrs': self.transit_time_hrs,
            'risk_factor': self.risk_factor,
            'mode_of_transport': self.mode_of_transport,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'expected_arrival': self.expected_arrival.isoformat() if self.expected_arrival else None,
            'actual_arrival': self.actual_arrival.isoformat() if self.actual_arrival else None,
            'current_location': self.current_location
        }

@event.listens_for(Shipment, 'before_update')
def validate_completed_shipment(target):
    if isinstance(target, Shipment):
        if target.status == 'completed' and not target.actual_arrival:
            target.actual_arrival = datetime.now(timezone.utc)
        elif target.status == 'cancelled' and not target.actual_arrival:
            target.actual_arrival = datetime.now(timezone.utc)
