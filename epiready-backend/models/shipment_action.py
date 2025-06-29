from datetime import datetime, timezone
from config.database import db
from sqlalchemy import event

class ShipmentAction(db.Model):
    __tablename__ = 'shipment_actions'

    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(db.String(50), db.ForeignKey('shipments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # e.g., 'status_update', 'location_update', 'temperature_alert', 'delivery_complete'
    description = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')  # default: active; possible: active, completed, cancelled
    action_metadata = db.Column(db.JSON)  # Store additional data like old_value, new_value, etc.
    
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    shipment = db.relationship('Shipment', backref='shipment_actions')
    user = db.relationship('User', backref='shipment_actions')
    
    def __repr__(self):
        return f'<ShipmentAction {self.id} for shipment {self.shipment_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'shipment_id': self.shipment_id,
            'user_id': self.user_id,
            'action_type': self.action_type,
            'description': self.description,
            'status': self.status,
            'action_metadata': self.action_metadata,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

@event.listens_for(ShipmentAction, 'before_update')
def validate_completed_action(target):
    if target.status == 'completed' and not target.completed_at:
        target.completed_at = datetime.now(timezone.utc) 