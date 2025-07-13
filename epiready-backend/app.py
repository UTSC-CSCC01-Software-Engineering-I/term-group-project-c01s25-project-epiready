import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from routes import all_blueprints
from dotenv import load_dotenv
from config.database import init_db, db
import os
from flask_migrate import Migrate

load_dotenv()

socketio = SocketIO(cors_allowed_origins=os.getenv("CORS_ORIGIN"))

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY")

    CORS(app, origins=os.getenv("CORS_ORIGIN"), supports_credentials=True)
    init_db(app)
    
    from socket_events import register_socketio_events
    from models import user, shipment, temperature, alert, weather, shipment_action

    migrate = Migrate(app, db)
    socketio.init_app(app)

    for blueprint, prefix in all_blueprints:
        app.register_blueprint(blueprint, url_prefix=prefix)

    register_socketio_events(socketio, app)
    return app

app = create_app()

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(status="Healthy"), 200

if __name__ == '__main__':
    socketio.run(app, debug=True)
