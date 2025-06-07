from datetime import datetime, timezone
from config.database import db
from sqlalchemy import event

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(db.String(50), db.ForeignKey('shipments.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # temperature, weather, eta
    severity = db.Column(db.String(10), nullable=False)  # low, medium, high
    message = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # active, inprogress, resolved
    
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    resolved_at = db.Column(db.DateTime)
    
    actions = db.relationship('ActionLog', backref='alert', lazy=True)

    def __repr__(self):
        return f'<Alert {self.id} for shipment {self.shipment_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'shipment_id': self.shipment_id,
            'type': self.type,
            'severity': self.severity,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }

@event.listens_for(Alert, 'before_update')
def validate_resolved_alert(target):
    if target.status == 'resolved' and not target.resolved_at:
        target.resolved_at = datetime.now(timezone.utc)

class ActionLog(db.Model):
    __tablename__ = 'action_logs'

    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id'), index=True, nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # email, sms, slack, manual_override
    status = db.Column(db.String(20), nullable=False)  # pending, completed, failed
    details = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    completed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<ActionLog {self.id} for alert {self.alert_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_id': self.alert_id,
            'action_type': self.action_type,
            'status': self.status,
            'details': self.details,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

@event.listens_for(ActionLog, 'before_update')
def validate_completed_action(target):
    if target.status == 'completed' and not target.completed_at:
        target.completed_at = datetime.now(timezone.utc) 