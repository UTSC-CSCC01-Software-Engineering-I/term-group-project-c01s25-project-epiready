from config.database import db
from datetime import datetime, timezone
import bcrypt

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='manufacturer')  # manufacturer, transporter, transporter_manager
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    organization = db.relationship('Organization', backref='users', lazy=True)

    shipments = db.relationship('Shipment', backref='user', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "email": self.email, 
            "role": self.role,
            "created_at": self.created_at.isoformat(),
            "organization_id": self.organization_id
        }

def create_user(email: str, raw_password: str, role: str = 'manufacturer') -> User:
    existing_user = User.query.filter_by(email=email).first()
    
    if existing_user:
        return None
    
    valid_roles = ['manufacturer', 'transporter', 'transporter_manager']
    if role not in valid_roles:
        role = 'manufacturer'
    
    pw_hash = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, password_hash=pw_hash, role=role)
    db.session.add(user)
    db.session.commit()
    return user

def verify_user(email: str, raw_password: str) -> bool:
    user = User.query.filter_by(email=email).first()
    if not user:
        return False
    
    if bcrypt.checkpw(raw_password.encode(), user.password_hash.encode()):
        return user
    
    return False
