from controllers.alerts import start_temperature_monitor
from flask_socketio import join_room
import jwt
import os

def register_socketio_events(socketio, app, mail):
    
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        return
    
    @socketio.on('connect')
    def handle_connect(auth):
        token = auth.get('token').split(" ")[1] if auth else None

        if not token:
            print("No token provided on socket connection.")
            return False
 
        try:
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = data['user_id']
            print(f"Socket connected for user {user_id}")
            join_room(str(user_id))

        except jwt.ExpiredSignatureError:
            print("Token expired")
            return False
        except jwt.InvalidTokenError:
            print("Invalid token")
            return False
        
    socketio.start_background_task(start_temperature_monitor, socketio, app, mail)
