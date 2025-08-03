from controllers.alerts import start_temperature_monitor
from flask_socketio import join_room, emit, leave_room
from models.chat import ChatRoom, ChatMessage
from models.user import User
from config.database import db
import jwt
import os

def register_socketio_events(socketio, app, mail):
    
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        return
    
    @socketio.on('connect')
    def handle_connect(auth):
        token = auth.get('token').split(" ")[1] if auth else None

        if not token:
            print("No token provided on socket connection.")
            return False
 
        try:
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = data['user_id']
            print(f"Socket connected for user {user_id}")
            join_room(str(user_id))

        except jwt.ExpiredSignatureError:
            print("Token expired")
            return False
        except jwt.InvalidTokenError:
            print("Invalid token")
            return False
    
    @socketio.on('join_chat_room')
    def handle_join_chat_room(data):
        """Join a specific chat room for real-time messaging"""
        try:
            token = data.get('token', '').split(" ")[1] if data.get('token') else None
            if not token:
                return False
            
            jwt_data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = jwt_data['user_id']
            room_id = data.get('room_id')
            
            if not room_id:
                return False
            
            # Verify user has access to this chat room
            user = db.session.get(User, user_id)
            chat_room = db.session.get(ChatRoom, room_id)
            
            if not chat_room or chat_room.organization_id != user.organization_id:
                return False
            
            # Check if user is participant
            is_participant = False
            if chat_room.room_type == 'direct':
                is_participant = (chat_room.participant1_id == user_id or chat_room.participant2_id == user_id)
            elif chat_room.room_type == 'group':
                is_participant = chat_room.participants and user_id in chat_room.participants
            
            if not is_participant:
                return False
            
            join_room(f"chat_room_{room_id}")
            print(f"User {user_id} joined chat room {room_id}")
            
        except Exception as e:
            print(f"Error joining chat room: {e}")
            return False
    
    @socketio.on('leave_chat_room')
    def handle_leave_chat_room(data):
        """Leave a specific chat room"""
        try:
            room_id = data.get('room_id')
            if room_id:
                leave_room(f"chat_room_{room_id}")
                print(f"User left chat room {room_id}")
        except Exception as e:
            print(f"Error leaving chat room: {e}")
    
    @socketio.on('send_message')
    def handle_send_message(data):
        """Handle real-time message sending"""
        try:
            token = data.get('token', '').split(" ")[1] if data.get('token') else None
            if not token:
                return False
            
            jwt_data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = jwt_data['user_id']
            room_id = data.get('room_id')
            content = data.get('content')
            message_type = data.get('message_type', 'text')
            
            if not room_id or not content:
                return False
            
            # Verify user has access to this chat room
            user = db.session.get(User, user_id)
            chat_room = db.session.get(ChatRoom, room_id)
            
            if not chat_room or chat_room.organization_id != user.organization_id:
                return False
            
            # Check if user is participant
            is_participant = False
            if chat_room.room_type == 'direct':
                is_participant = (chat_room.participant1_id == user_id or chat_room.participant2_id == user_id)
            elif chat_room.room_type == 'group':
                is_participant = chat_room.participants and user_id in chat_room.participants
            
            if not is_participant:
                return False
            
            # Create and save message
            message = ChatMessage(
                chat_room_id=room_id,
                sender_id=user_id,
                content=content,
                message_type=message_type
            )
            
            db.session.add(message)
            db.session.commit()
            
            # Emit message to all users in the chat room
            message_data = message.to_dict()
            socketio.emit('new_message', message_data, room=f"chat_room_{room_id}")
            
            print(f"Message sent in room {room_id} by user {user_id}")
            
        except Exception as e:
            print(f"Error sending message: {e}")
            return False
        
    socketio.start_background_task(start_temperature_monitor, socketio, app, mail)
