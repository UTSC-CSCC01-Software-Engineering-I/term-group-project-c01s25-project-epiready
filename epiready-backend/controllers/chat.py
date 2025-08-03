from flask import jsonify, request
from models.chat import ChatRoom, ChatMessage
from models.user import User
from models.organization import Organization
from auth.auth import token_required
from config.database import db
from datetime import datetime, timezone

@token_required
def get_user_chat_rooms(user_id):
    """
    GET /chat/rooms
    
    Get all chat rooms for the current user within their organization.
    
    Authentication: Bearer token in Authorization header
    
    Returns:
    - List of chat rooms with basic info
    """
    try:
        user = db.session.get(User, user_id)
        if not user or not user.organization_id:
            return jsonify({"error": "User not found or not in organization"}), 404
        
        # Get all chat rooms in the user's organization
        chat_rooms = ChatRoom.query.filter_by(organization_id=user.organization_id).all()
        
        # Filter rooms where user is a participant
        user_rooms = []
        for room in chat_rooms:
            if room.room_type == 'direct':
                if room.participant1_id == user_id or room.participant2_id == user_id:
                    user_rooms.append(room)
            elif room.room_type == 'group':
                if room.participants and user_id in room.participants:
                    user_rooms.append(room)
        
        return jsonify([room.to_dict() for room in user_rooms]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def create_direct_chat(user_id):
    """
    POST /chat/direct
    
    Create a direct chat room with another user in the same organization.
    
    Request Body:
    {
        "other_user_id": 123
    }
    
    Authentication: Bearer token in Authorization header
    """
    try:
        data = request.get_json()
        other_user_id = data.get('other_user_id')
        
        if not other_user_id:
            return jsonify({"error": "other_user_id is required"}), 400
        
        current_user = db.session.get(User, user_id)
        other_user = db.session.get(User, other_user_id)
        
        if not current_user or not other_user:
            return jsonify({"error": "User not found"}), 404
        
        if current_user.organization_id != other_user.organization_id:
            return jsonify({"error": "Users must be in the same organization"}), 400
        
        # Check if direct chat already exists
        existing_room = ChatRoom.query.filter(
            ((ChatRoom.participant1_id == user_id) & (ChatRoom.participant2_id == other_user_id)) |
            ((ChatRoom.participant1_id == other_user_id) & (ChatRoom.participant2_id == user_id)),
            ChatRoom.room_type == 'direct',
            ChatRoom.organization_id == current_user.organization_id
        ).first()
        
        if existing_room:
            return jsonify(existing_room.to_dict()), 200
        
        # Create new direct chat room
        chat_room = ChatRoom(
            room_type='direct',
            organization_id=current_user.organization_id,
            created_by=user_id,
            participant1_id=user_id,
            participant2_id=other_user_id
        )
        
        db.session.add(chat_room)
        db.session.commit()
        
        return jsonify(chat_room.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def create_group_chat(user_id):
    """
    POST /chat/group
    
    Create a group chat room with multiple users in the same organization.
    
    Request Body:
    {
        "name": "Team Chat",
        "participant_ids": [123, 456, 789]
    }
    
    Authentication: Bearer token in Authorization header
    """
    try:
        data = request.get_json()
        name = data.get('name')
        participant_ids = data.get('participant_ids', [])
        
        if not name:
            return jsonify({"error": "Group name is required"}), 400
        
        if not participant_ids:
            return jsonify({"error": "At least one participant is required"}), 400
        
        current_user = db.session.get(User, user_id)
        if not current_user or not current_user.organization_id:
            return jsonify({"error": "User not found or not in organization"}), 404
        
        # Add current user to participants if not already included
        if user_id not in participant_ids:
            participant_ids.append(user_id)
        
        # Verify all participants are in the same organization
        participants = User.query.filter(
            User.id.in_(participant_ids),
            User.organization_id == current_user.organization_id
        ).all()
        
        if len(participants) != len(participant_ids):
            return jsonify({"error": "Some users are not in the same organization"}), 400
        
        # Create group chat room
        chat_room = ChatRoom(
            name=name,
            room_type='group',
            organization_id=current_user.organization_id,
            created_by=user_id,
            participants=participant_ids
        )
        
        db.session.add(chat_room)
        db.session.commit()
        
        return jsonify(chat_room.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def get_chat_messages(user_id):
    """
    GET /chat/messages?room_id=123
    
    Get messages for a specific chat room.
    
    Query Parameters:
    - room_id: ID of the chat room
    - limit: Number of messages to return (default: 50)
    - offset: Number of messages to skip (default: 0)
    
    Authentication: Bearer token in Authorization header
    """
    try:
        room_id = request.args.get('room_id')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        if not room_id:
            return jsonify({"error": "room_id is required"}), 400
        
        # Verify user has access to this chat room
        current_user = db.session.get(User, user_id)
        chat_room = db.session.get(ChatRoom, room_id)
        
        if not chat_room or chat_room.organization_id != current_user.organization_id:
            return jsonify({"error": "Chat room not found or access denied"}), 404
        
        # Check if user is participant
        is_participant = False
        if chat_room.room_type == 'direct':
            is_participant = (chat_room.participant1_id == user_id or chat_room.participant2_id == user_id)
        elif chat_room.room_type == 'group':
            is_participant = chat_room.participants and user_id in chat_room.participants
        
        if not is_participant:
            return jsonify({"error": "Access denied to this chat room"}), 403
        
        # Get messages
        messages = ChatMessage.query.filter_by(
            chat_room_id=room_id,
            is_deleted=False
        ).order_by(ChatMessage.created_at.desc()).limit(limit).offset(offset).all()
        
        # Reverse to get chronological order
        messages.reverse()
        
        return jsonify([message.to_dict() for message in messages]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def send_message(user_id):
    """
    POST /chat/messages
    
    Send a message to a chat room.
    
    Request Body:
    {
        "room_id": 123,
        "content": "Hello everyone!",
        "message_type": "text"
    }
    
    Authentication: Bearer token in Authorization header
    """
    try:
        data = request.get_json()
        room_id = data.get('room_id')
        content = data.get('content')
        message_type = data.get('message_type', 'text')
        
        if not room_id or not content:
            return jsonify({"error": "room_id and content are required"}), 400
        
        # Verify user has access to this chat room
        current_user = db.session.get(User, user_id)
        chat_room = db.session.get(ChatRoom, room_id)
        
        if not chat_room or chat_room.organization_id != current_user.organization_id:
            return jsonify({"error": "Chat room not found or access denied"}), 404
        
        # Check if user is participant
        is_participant = False
        if chat_room.room_type == 'direct':
            is_participant = (chat_room.participant1_id == user_id or chat_room.participant2_id == user_id)
        elif chat_room.room_type == 'group':
            is_participant = chat_room.participants and user_id in chat_room.participants
        
        if not is_participant:
            return jsonify({"error": "Access denied to this chat room"}), 403
        
        # Create message
        message = ChatMessage(
            chat_room_id=room_id,
            sender_id=user_id,
            content=content,
            message_type=message_type
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify(message.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def edit_message(user_id):
    """
    PUT /chat/messages/<message_id>
    
    Edit a message (only by the sender).
    
    Request Body:
    {
        "content": "Updated message content"
    }
    
    Authentication: Bearer token in Authorization header
    """
    try:
        message_id = request.view_args.get('message_id')
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({"error": "content is required"}), 400
        
        message = db.session.get(ChatMessage, message_id)
        if not message:
            return jsonify({"error": "Message not found"}), 404
        
        if message.sender_id != user_id:
            return jsonify({"error": "You can only edit your own messages"}), 403
        
        message.content = content
        message.is_edited = True
        message.updated_at = datetime.now(timezone.utc)
        
        db.session.commit()
        
        return jsonify(message.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def delete_message(user_id):
    """
    DELETE /chat/messages/<message_id>
    
    Delete a message (only by the sender).
    
    Authentication: Bearer token in Authorization header
    """
    try:
        message_id = request.view_args.get('message_id')
        
        message = db.session.get(ChatMessage, message_id)
        if not message:
            return jsonify({"error": "Message not found"}), 404
        
        if message.sender_id != user_id:
            return jsonify({"error": "You can only delete your own messages"}), 403
        
        message.is_deleted = True
        message.updated_at = datetime.now(timezone.utc)
        
        db.session.commit()
        
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def get_organization_users(user_id):
    """
    GET /chat/users
    
    Get all users in the current user's organization for creating chats.
    
    Authentication: Bearer token in Authorization header
    """
    try:
        current_user = db.session.get(User, user_id)
        if not current_user or not current_user.organization_id:
            return jsonify({"error": "User not found or not in organization"}), 404
        
        users = User.query.filter_by(organization_id=current_user.organization_id).all()
        
        return jsonify([{
            'id': user.id,
            'email': user.email,
            'role': user.role
        } for user in users]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500 