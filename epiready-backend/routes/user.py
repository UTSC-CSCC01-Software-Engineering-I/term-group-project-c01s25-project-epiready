from flask import Blueprint
from controllers.user import get_user

user_blueprint = Blueprint("users", __name__)
user_blueprint.route("", methods=["POST"])(get_user)