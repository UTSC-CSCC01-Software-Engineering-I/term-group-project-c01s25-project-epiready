import bcrypt

users = []

def create_user(email: str, password: str) -> None:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    users.append({"email": email, "password": hashed})

def verify_user(email: str, password: str) -> bool:
    verified_username = next((u for u in users if u["email"] == email), None)
    if not verified_username:
        return False
    return bcrypt.checkpw(password.encode(), verified_username["password"])
