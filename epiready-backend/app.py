from flask import Flask, jsonify
from flask_cors import CORS
from routes.routes import blueprint

app = Flask(__name__)
app.secret_key = "SECRET_KEY"
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from backend!"})

app.register_blueprint(blueprint, url_prefix="/api/auth")

if __name__ == '__main__':
    app.run(debug=True)
