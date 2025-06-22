from flask import Blueprint
from controllers.user import get_user, get_users_by_role, get_all_users

user_blueprint = Blueprint("users", __name__)
user_blueprint.route("", methods=["POST"])(get_user)
user_blueprint.route("/all", methods=["GET"])(get_all_users)
user_blueprint.route("/role/<role>", methods=["GET"])(get_users_by_role)