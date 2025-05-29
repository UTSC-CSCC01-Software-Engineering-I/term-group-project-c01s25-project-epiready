from flask import Blueprint
from controllers.controller import signup, login

blueprint = Blueprint("authentication", __name__)
blueprint.route("/signup", methods=["POST"])(signup)
blueprint.route("/login", methods=["POST"])(login)