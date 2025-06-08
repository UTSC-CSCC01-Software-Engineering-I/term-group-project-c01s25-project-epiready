from flask import jsonify

def get_user():
    return jsonify({"message": "Simulated get user"}), 200