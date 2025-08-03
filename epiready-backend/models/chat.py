from datetime import datetime, timezone
from config.database import db
from sqlalchemy.dialects.postgresql import JSON

class ChatRoom(db.Model):
    __tablename__ = 'chat_rooms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)  # For group chats, null for direct messages
    room_type = db.Column(db.String(20), nullable=False)  # 'direct' or 'group'
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    
    # For direct messages, store the two user IDs
    participant1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    participant2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # For group chats, store all participants in JSON
    participants = db.Column(JSON, nullable=True)  # Array of user IDs
    
    # Relationships
    organization = db.relationship('Organization', backref='chat_rooms')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_chat_rooms')
    participant1 = db.relationship('User', foreign_keys=[participant1_id])
    participant2 = db.relationship('User', foreign_keys=[participant2_id])
    messages = db.relationship('ChatMessage', backref='chat_room', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'room_type': self.room_type,
            'organization_id': self.organization_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'participant1_id': self.participant1_id,
            'participant2_id': self.participant2_id,
            'participants': self.participants,
            'message_count': self.messages.count()
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    chat_room_id = db.Column(db.Integer, db.ForeignKey('chat_rooms.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), nullable=False, default='text')  # 'text', 'file', 'image'
    file_url = db.Column(db.String(500), nullable=True)  # For file/image messages
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=lambda *_: datetime.now(timezone.utc))
    is_edited = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # Relationships
    sender = db.relationship('User', backref='chat_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'chat_room_id': self.chat_room_id,
            'sender_id': self.sender_id,
            'sender_email': self.sender.email if self.sender else None,
            'content': self.content,
            'message_type': self.message_type,
            'file_url': self.file_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_edited': self.is_edited,
            'is_deleted': self.is_deleted
        } 