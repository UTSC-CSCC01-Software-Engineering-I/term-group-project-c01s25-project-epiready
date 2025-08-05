from flask import jsonify, request
from models.user import User
from auth.auth import token_required
from config.database import db
from models.organization import Organization

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
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def get_users_by_role(user_id):
    """
    GET /users/role/<role>
    
    Get all users with a specific role in organization. Only accessible by transporter_manager.
    
    Possible Error Responses:
    - 403 Forbidden: "Access denied. Only transporter managers can view users by role."
    - 400 Bad Request: "Invalid role"
    """
    try:
        # Check if current user is a transporter manager
        current_user = db.session.get(User, user_id)
        if current_user.role != 'transporter_manager':
            return jsonify({"error": "Access denied. Only transporter managers can view users by role."}), 403
        
        role = request.view_args.get('role')
        valid_roles = ['manufacturer', 'transporter', 'transporter_manager']
        
        if role not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        
        users = User.query.filter_by(role=role, organization_id=current_user.organization_id).all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def get_all_users(user_id):
    """
    GET /users
    
    Get all users in organization. Only accessible by transporter_manager.
    
    Possible Error Responses:
    - 403 Forbidden: "Access denied. Only transporter managers can view all users."
    """
    try:
        # Check if current user is a transporter manager
        current_user = db.session.get(User, user_id)
        if current_user.role != 'transporter_manager':
            return jsonify({"error": "Access denied. Only transporter managers can view all users."}), 403
        
        users = User.query.filter_by(organization_id=current_user.organization_id).all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@token_required
def create_organization(user_id):
    """
    POST /users/create-organization
    
    Creates a new organization. The current user becomes transporter_manager of the created org.
    
    Request Body:
    {
        "name": "OrgName",
        "join_code": "CODE123"
    }
    
    Possible Error Responses:
    - 400 Bad Request: "Organization name and join code are required."
    - 400 Bad Request: "Organization name already exists."
    - 400 Bad Request: "Join code already exists."
    """
    data = request.get_json()
    name = data.get('name')
    join_code = data.get('join_code')
    if not name or not join_code:
        return jsonify({'error': 'Organization name and join code are required.'}), 400
    if Organization.query.filter_by(name=name).first():
        return jsonify({'error': 'Organization name already exists.'}), 400
    if Organization.query.filter_by(join_code=join_code).first():
        return jsonify({'error': 'Join code already exists.'}), 400
    org = Organization(name=name, join_code=join_code)
    db.session.add(org)
    db.session.commit()
    # Assign current user to the organization and set their role
    user = db.session.get(User, user_id)
    user.organization_id = org.id
    user.role = 'transporter_manager'
    db.session.commit()
    return jsonify(org.to_dict()), 201

@token_required
def join_organization(user_id):
    """
    POST /users/join-organization
    
    Join an existing organization by join_code.
    
    Request Body:
    {
        "join_code": "CODE123"
    }
    
    Possible Error Responses:
    - 400 Bad Request: "Join code is required."
    - 400 Bad Request: "User already belongs to an organization."
    - 404 Not Found: "Invalid join code."
    """
    data = request.get_json()
    join_code = data.get('join_code')
    if not join_code:
        return jsonify({'error': 'Join code is required.'}), 400
    user = db.session.get(User, user_id)
    if hasattr(user, 'organization_id') and user.organization_id:
        return jsonify({'error': 'User already belongs to an organization.'}), 400
    org = Organization.query.filter_by(join_code=join_code).first()
    if not org:
        return jsonify({'error': 'Invalid join code.'}), 404
    user.organization_id = org.id
    db.session.commit()
    return jsonify({'message': 'Joined organization successfully.', 'organization': org.to_dict()}), 200

@token_required
def get_organization_by_id(user_id):
    """
    GET /users/organization
    
    Get organization details by id.
    
    Possible Error Responses:
    - 400 Bad Request: "Organization id is required."
    - 404 Not Found: "Organization not found."
    """
    org_id = request.args.get('id')
    if not org_id:
        return jsonify({'error': 'Organization id is required.'}), 400
    org = db.session.get(Organization, org_id)
    if not org:
        return jsonify({'error': 'Organization not found.'}), 404
    return jsonify(org.to_dict()), 200
