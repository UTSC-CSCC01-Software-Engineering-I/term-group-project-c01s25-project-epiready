from flask import jsonify, request
from datetime import datetime, timezone
from auth.auth import token_required
from models.chat import ChatRoom, ChatMessage
from models.user import User
from config.database import db


@token_required
def get_user_chat_rooms(user_id):
    try:
        user = User.query.get(user_id)
        if not user or not user.organization_id:
            return jsonify({"error": "User not found or not in organization"}), 404
        rooms = ChatRoom.query.filter_by(organization_id=user.organization_id).all()
        user_rooms = []
        for room in rooms:
            if room.room_type == "direct":
                p1 = getattr(room, "participant1_id", None)
                p2 = getattr(room, "participant2_id", None)
                if p1 == user_id or p2 == user_id:
                    user_rooms.append(room)
            elif room.room_type == "group":
                participants = getattr(room, "participants", [])
                if participants and user_id in participants:
                    user_rooms.append(room)
        return jsonify([r.to_dict() for r in user_rooms]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@token_required
def create_direct_chat(user_id):
    try:
        data = request.get_json()
        other_user_id = data.get("other_user_id")
        if not other_user_id:
            return jsonify({"error": "other_user_id is required"}), 400
        current_user = User.query.get(user_id)
        other_user = User.query.get(other_user_id)
        if not current_user or not other_user:
            return jsonify({"error": "User not found"}), 404
        if current_user.organization_id != other_user.organization_id:
            return jsonify({"error": "Users must be in the same organization"}), 400
        existing = None
        for room in ChatRoom.query.filter_by(
            organization_id=current_user.organization_id, room_type="direct"
        ).all():
            p1 = getattr(room, "participant1_id", None)
            p2 = getattr(room, "participant2_id", None)
            if (p1 == user_id and p2 == other_user_id) or (
                p1 == other_user_id and p2 == user_id
            ):
                existing = room
                break
        if existing:
            return jsonify(existing.to_dict()), 200
        chat_room = ChatRoom(
            room_type="direct",
            organization_id=current_user.organization_id,
            created_by=user_id,
            participant1_id=user_id,
            participant2_id=other_user_id,
        )
        db.session.add(chat_room)
        db.session.commit()
        return jsonify(chat_room.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@token_required
def create_group_chat(user_id):
    try:
        data = request.get_json()
        name = data.get("room_name") or data.get("name")
        participant_ids = data.get("participant_ids", [])
        if not name:
            return jsonify({"error": "Group name is required"}), 400
        if not participant_ids:
            return jsonify({"error": "At least one participant is required"}), 400
        current_user = User.query.get(user_id)
        if not current_user or not current_user.organization_id:
            return jsonify({"error": "User not found or not in organization"}), 404
        if user_id not in participant_ids:
            participant_ids.append(user_id)
        participants = User.query.filter(
            User.id.in_(participant_ids),
            User.organization_id == current_user.organization_id,
        ).all()
        if len(participants) != len(participant_ids):
            return (
                jsonify({"error": "Some users are not in the same organization"}),
                400,
            )
        chat_room = ChatRoom(
            name=name,
            room_type="group",
            organization_id=current_user.organization_id,
            created_by=user_id,
            participants=participant_ids,
        )
        db.session.add(chat_room)
        db.session.commit()
        return jsonify(chat_room.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@token_required
def get_chat_messages(user_id):
    try:
        room_id = request.args.get("room_id")
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))
        if not room_id:
            return jsonify({"error": "room_id is required"}), 400
        room = ChatRoom.query.get(room_id)
        current_user = User.query.get(user_id)
        if not room or room.organization_id != getattr(current_user, "organization_id", None):
            return jsonify({"error": "Chat room not found or access denied"}), 404
        is_participant = False
        if room.room_type == "direct":
            p1 = getattr(room, "participant1_id", None)
            p2 = getattr(room, "participant2_id", None)
            is_participant = p1 == user_id or p2 == user_id
        elif room.room_type == "group":
            participants = getattr(room, "participants", [])
            is_participant = participants and user_id in participants
        if not is_participant:
            return jsonify({"error": "Access denied to this chat room"}), 403
        messages = (
            ChatMessage.query.filter_by(chat_room_id=room_id, is_deleted=False)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )
        messages.reverse()
        return jsonify([m.to_dict() for m in messages]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@token_required
def send_message(user_id):
    try:
        data = request.get_json()
        room_id = data.get("room_id")
        content = data.get("content")
        message_type = data.get("message_type", "text")
        if not room_id or not content:
            return jsonify({"error": "room_id and content are required"}), 400
        room = ChatRoom.query.get(room_id)
        current_user = User.query.get(user_id)
        if not room or room.organization_id != getattr(current_user, "organization_id", None):
            return jsonify({"error": "Chat room not found or access denied"}), 404
        is_participant = False
        if room.room_type == "direct":
            p1 = getattr(room, "participant1_id", None)
            p2 = getattr(room, "participant2_id", None)
            is_participant = p1 == user_id or p2 == user_id
        elif room.room_type == "group":
            participants = getattr(room, "participants", [])
            is_participant = participants and user_id in participants
        if not is_participant:
            return jsonify({"error": "Access denied to this chat room"}), 403
        message = ChatMessage(
            chat_room_id=room_id,
            sender_id=user_id,
            content=content,
            message_type=message_type,
        )
        db.session.add(message)
        db.session.commit()
        return jsonify(message.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@token_required
def edit_message(user_id, message_id):
    try:
        data = request.get_json()
        content = data.get("content")
        if not content:
            return jsonify({"error": "content is required"}), 400
        message = ChatMessage.query.get(message_id)
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
def delete_message(user_id, message_id):
    try:
        message = ChatMessage.query.get(message_id)
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
    try:
        current_user = User.query.get(user_id)
        if not current_user or not current_user.organization_id:
            return jsonify({"error": "User not found or not in organization"}), 404
        users = User.query.filter_by(organization_id=current_user.organization_id).all()
        return (
            jsonify(
                [
                    {"id": u.id, "email": u.email, "role": getattr(u, "role", None)}
                    for u in users
                ]
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
