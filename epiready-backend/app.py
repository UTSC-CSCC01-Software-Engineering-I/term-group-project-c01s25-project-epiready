import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_mail import Mail
from flask_cors import CORS
from flask_socketio import SocketIO
from routes import all_blueprints
from dotenv import load_dotenv
from config.database import init_db, db
import os
from flask_migrate import Migrate
import models

load_dotenv()

socketio = SocketIO(cors_allowed_origins=os.getenv("CORS_ORIGIN"))

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY")

    print("CORS_ORIGIN:", os.getenv("CORS_ORIGIN"))

    CORS(app, origins=[os.getenv("CORS_ORIGIN")], supports_credentials=True)
    init_db(app)
    
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_USE_TLS'] = True
    
    from socket_events import register_socketio_events
    from models import user, shipment, temperature, alert, weather, shipment_action

    migrate = Migrate(app, db)
    socketio.init_app(app)
    mail = Mail(app)

    for blueprint, prefix in all_blueprints:
        app.register_blueprint(blueprint, url_prefix=prefix)

    register_socketio_events(socketio, app, mail)
    return app
 
app = create_app()

@app.route("/health", methods=["GET"])
def health_check():
    print("CORS_ORIGIN:", os.getenv("CORS_ORIGIN"))

    return jsonify(status="Healthy"), 200

@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "frame-ancestors 'none';"
    return response

if __name__ == '__main__' and os.getenv("FLASK_ENV") == "development":
    socketio.run(app, debug=True)
