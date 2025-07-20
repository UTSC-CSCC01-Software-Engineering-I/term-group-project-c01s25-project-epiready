from config.database import db
from datetime import datetime, timezone

class Organization(db.Model):
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    join_code = db.Column(db.String(20), unique=True, nullable=False)  # specified by creator
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'join_code': self.join_code,
            'created_at': self.created_at.isoformat()
        } 