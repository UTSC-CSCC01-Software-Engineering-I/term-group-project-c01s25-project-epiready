from flask import Flask, jsonify
from flask_cors import CORS
from routes.routes import blueprint
from dotenv import load_dotenv
from config.database import init_db

load_dotenv()

app = Flask(__name__)
app.secret_key = "SECRET_KEY"
CORS(app)

init_db(app)

app.register_blueprint(blueprint, url_prefix="/api/auth")

if __name__ == '__main__':
    app.run(debug=True)
