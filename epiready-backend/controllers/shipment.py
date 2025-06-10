from flask import jsonify

def create_shipment():
    return jsonify({"message": "Simulated shipment creation"}), 200