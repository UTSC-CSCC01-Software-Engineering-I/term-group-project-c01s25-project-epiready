from flask import Flask, jsonify
from flask_cors import CORS
from routes import all_blueprints
from dotenv import load_dotenv
from config.database import init_db
import os

from models import user, shipment, temperature, alert, weather

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
CORS(app)

init_db(app)

for blueprint, prefix in all_blueprints:
    app.register_blueprint(blueprint, url_prefix=prefix)

if __name__ == '__main__':
    app.run(debug=True)
