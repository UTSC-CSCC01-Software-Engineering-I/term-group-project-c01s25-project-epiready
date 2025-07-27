from flask import Blueprint
from controllers.chat import (
    get_user_chat_rooms,
    create_direct_chat,
    create_group_chat,
    get_chat_messages,
    send_message,
    edit_message,
    delete_message,
    get_organization_users
)

chat_blueprint = Blueprint("chat", __name__)

# Chat room management
chat_blueprint.route("/rooms", methods=["GET"])(get_user_chat_rooms)
chat_blueprint.route("/direct", methods=["POST"])(create_direct_chat)
chat_blueprint.route("/group", methods=["POST"])(create_group_chat)

# Message management
chat_blueprint.route("/messages", methods=["GET"])(get_chat_messages)
chat_blueprint.route("/messages", methods=["POST"])(send_message)
chat_blueprint.route("/messages/<int:message_id>", methods=["PUT"])(edit_message)
chat_blueprint.route("/messages/<int:message_id>", methods=["DELETE"])(delete_message)

# User management
chat_blueprint.route("/users", methods=["GET"])(get_organization_users) 