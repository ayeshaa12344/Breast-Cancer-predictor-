from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import json
import os

app = Flask(__name__)

scaler = joblib.load("models/scaler.pkl")

MODELS = {
    "logistic":      joblib.load("models/logistic_model.pkl"),
    "decision_tree": joblib.load("models/decision_tree_model.pkl"),
    "random_forest": joblib.load("models/random_forest_model.pkl"),
}

FEATURE_NAMES = [
    "mean radius", "mean texture", "mean perimeter", "mean area",
    "mean smoothness", "mean compactness", "mean concavity",
    "mean concave points", "mean symmetry", "mean fractal dimension",
    "radius error", "texture error", "perimeter error", "area error",
    "smoothness error", "compactness error", "concavity error",
    "concave points error", "symmetry error", "fractal dimension error",
    "worst radius", "worst texture", "worst perimeter", "worst area",
    "worst smoothness", "worst compactness", "worst concavity",
    "worst concave points", "worst symmetry", "worst fractal dimension"
]

@app.route("/")
def index():
    return render_template("index.html", features=FEATURE_NAMES)

@app.route("/compare")
def compare():
    return render_template("compare.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        model_name = data.get("model", "random_forest")
        features = [float(data["features"][f]) for f in FEATURE_NAMES]
        features_sc = scaler.transform([features])
        model = MODELS[model_name]
        prediction = int(model.predict(features_sc)[0])
        probability = model.predict_proba(features_sc)[0].tolist()
        label = "Benign" if prediction == 1 else "Malignant"
        return jsonify({
            "prediction": label,
            "confidence": round(max(probability) * 100, 2),
            "malignant_prob": round(probability[0] * 100, 2),
            "benign_prob": round(probability[1] * 100, 2),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/metrics")
def metrics():
    with open("models/metrics.json") as f:
        return jsonify(json.load(f))

if __name__ == "__main__":
    app.run(debug=True)