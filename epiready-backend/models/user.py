from config.database import db
from datetime import datetime, timezone
import bcrypt

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    shipments = db.relationship('Shipment', backref='user', lazy=True)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "created_at": self.created_at.isoformat()}

def create_user(email: str, raw_password: str) -> User:
    existing_user = User.query.filter_by(email=email).first()
    
    if existing_user:
        return None
    
    pw_hash = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, password_hash=pw_hash)
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
