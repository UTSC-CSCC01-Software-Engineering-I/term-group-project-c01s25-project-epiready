from flask import request, jsonify, current_app
import jwt
from models.user import create_user, verify_user
from datetime import datetime, timedelta, timezone

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