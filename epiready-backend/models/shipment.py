from datetime import datetime, timezone
from config.database import db
from sqlalchemy import event

class Shipment(db.Model):
    __tablename__ = 'shipments'

    id = db.Column(db.String(50), primary_key=True)
    status = db.Column(db.String(20), nullable=False)  # active, completed, cancelled

    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=lambda *_: datetime.now(timezone.utc))
    
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    # optionally current location of shipment, if available
    current_location = db.Column(db.String(100))
    
    # Temperature requirements for the shipment
    min_temperature = db.Column(db.Float, nullable=False)
    max_temperature = db.Column(db.Float, nullable=False)

    expected_arrival = db.Column(db.DateTime, nullable=False)
    actual_arrival = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Shipment {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'origin': self.origin,
            'destination': self.destination,
            'current_location': self.current_location,
            'min_temperature': self.min_temperature,
            'max_temperature': self.max_temperature,
            'expected_arrival': self.expected_arrival.isoformat(),
            'actual_arrival': self.actual_arrival.isoformat() if self.actual_arrival else None
        } 

@event.listens_for(Shipment, 'before_update')
def validate_completed_shipment(target):
    if target.status == 'completed' and not target.actual_arrival:
        target.actual_arrival = datetime.now(timezone.utc) 