from flask import Blueprint
from controllers.auth import signup, login

auth_blueprint = Blueprint("auth", __name__)
auth_blueprint.route("/signup", methods=["POST"])(signup)
auth_blueprint.route("/login", methods=["POST"])(login)