from flask import Blueprint
from controllers.user import get_user, get_users_by_role, get_all_users, create_organization, join_organization, get_organization_by_id
from controllers.shipment_action import get_user_action_history

user_blueprint = Blueprint("users", __name__)
user_blueprint.route("", methods=["POST"])(get_user)
user_blueprint.route("/all", methods=["GET"])(get_all_users)
user_blueprint.route("/role/<role>", methods=["GET"])(get_users_by_role)
user_blueprint.route("/<int:user_id>/actions", methods=["GET"])(get_user_action_history)
user_blueprint.route("/create-organization", methods=["POST"])(create_organization)
user_blueprint.route("/join-organization", methods=["POST"])(join_organization)
user_blueprint.route("/organization", methods=["GET"])(get_organization_by_id)