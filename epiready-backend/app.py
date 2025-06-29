import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from routes import all_blueprints
from dotenv import load_dotenv
from config.database import init_db
import os
from socket_events import register_socketio_events
from models import user, shipment, temperature, alert, weather, shipment_action

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
CORS(app, origins=os.getenv("CORS_ORIGIN"), supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins=os.getenv("CORS_ORIGIN"))

init_db(app)
register_socketio_events(socketio, app)

for blueprint, prefix in all_blueprints:
    app.register_blueprint(blueprint, url_prefix=prefix)

if __name__ == '__main__':
    app.run(debug=True)
