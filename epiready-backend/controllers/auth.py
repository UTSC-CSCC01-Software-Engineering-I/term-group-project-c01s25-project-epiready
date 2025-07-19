from flask import request, jsonify, current_app
import jwt
from models.user import create_user, verify_user, User
from datetime import datetime, timedelta, timezone
from auth.auth import token_required
from config.database import db
import bcrypt

def generate_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1), 
        "iat": datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, current_app.secret_key, algorithm="HS256")
    return token
    
def signup():
    
    """
    POST /auth/signup

    Registers a new user.

    Request Body:
    {
        "email": "user@example.com",
        "password": "password123",
        "role": "manufacturer"  // Optional: manufacturer, transporter, transporter_manager
    }

    Possible Error Responses:
    - 400 Bad Request: "Please type both email and password as they are both required."
    - 400 Bad Request: "Invalid role. Must be one of: manufacturer, transporter, transporter_manager"
    - 400 Bad Request: "This email address is already registered as a user."
    """

    data = request.get_json(force=True)
    email, password = data.get("email"), data.get("password")
    role = data.get("role", "manufacturer")
    
    if not email or not password:
        return jsonify({"error": "Please type both email and password as they are both required."}), 400
    
    valid_roles = ['manufacturer', 'transporter', 'transporter_manager']
    if role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
    
    if not create_user(email, password, role):
        return jsonify({"error": "This email address is already registered as a user."}), 400
    
    return jsonify({"message": "User registered successfully!"}), 200

def login():
    
    """
    POST /auth/login

    Authenticates a user and returns a token.

    Possible Error Responses:
    - 400 Bad Request: "Email and password required"
    - 401 Unauthorized: "Wrong username/password"
    """
    
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    user = verify_user(data.get("email"), data.get("password"))
    
    if user:
        token = generate_token(user.id)
        return jsonify({"message": "Login successful!", "token": token, "user_id": user.id}), 200
    
    return jsonify({"error": "Wrong username/password"}), 401

@token_required
def change_password(user_id):
    """
    POST /auth/change-password

    Allows an authenticated user to change their password.

    Request Body:
    {
        "old_password": "oldpass",
        "new_password": "newpass"
    }

    Authentication: Bearer token in Authorization header

    Possible Error Responses:
    - 400 Bad Request: "Both old_password and new_password are required."
    - 401 Unauthorized: "Old password is incorrect."
    - 404 Not Found: "User not found."
    """
    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "Both old_password and new_password are required."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    if not bcrypt.checkpw(old_password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Old password is incorrect."}), 401

    user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db.session.commit()
    return jsonify({"message": "Password changed successfully!"}), 200