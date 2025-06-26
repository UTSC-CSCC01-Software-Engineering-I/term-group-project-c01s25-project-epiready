from flask import jsonify, request
from models.user import User
from auth.auth import token_required
from config.database import db

@token_required
def get_user(user_id):
    """
    POST /users
    
    Get current user information. Uses POST method for consistency with other authenticated endpoints.
    
    Authentication: Bearer token in Authorization header
    
    Possible Error Responses:
    - 404 Not Found: "User not found"
    - 401 Unauthorized: "Token is missing" or "Invalid token"
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def get_users_by_role(user_id):
    """
    GET /users/role/<role>
    
    Get all users with a specific role. Only accessible by transporter_manager.
    
    Possible Error Responses:
    - 403 Forbidden: "Access denied. Only transporter managers can view users by role."
    - 400 Bad Request: "Invalid role"
    """
    try:
        # Check if current user is a transporter manager
        current_user = User.query.get(user_id)
        if current_user.role != 'transporter_manager':
            return jsonify({"error": "Access denied. Only transporter managers can view users by role."}), 403
        
        role = request.view_args.get('role')
        valid_roles = ['manufacturer', 'transporter', 'transporter_manager']
        
        if role not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        
        users = User.query.filter_by(role=role).all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def get_all_users(user_id):
    """
    GET /users
    
    Get all users. Only accessible by transporter_manager.
    
    Possible Error Responses:
    - 403 Forbidden: "Access denied. Only transporter managers can view all users."
    """
    try:
        # Check if current user is a transporter manager
        current_user = User.query.get(user_id)
        if current_user.role != 'transporter_manager':
            return jsonify({"error": "Access denied. Only transporter managers can view all users."}), 403
        
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500