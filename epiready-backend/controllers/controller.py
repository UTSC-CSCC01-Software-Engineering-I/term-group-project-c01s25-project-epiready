from flask import request, jsonify
from models.user import create_user, verify_user

def signup():
    data = request.get_json(force=True)
    email, password = data.get("email"), data.get("password")
    if not email or not password:
        return jsonify({"error": "Please type both email and password as they are both required."}), 400
    create_user(email, password)
    return jsonify({"message": "User registered successfully!"}), 201

def login():
    data = request.get_json(force=True)
    if verify_user(data.get("email"), data.get("password")):
        return jsonify({"message": "Login successful!"})
    return jsonify({"error": "Wrong username/password"}), 401
