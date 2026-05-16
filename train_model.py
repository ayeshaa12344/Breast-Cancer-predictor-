import pandas as pd
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os
import json

data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = pd.Series(data.target)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

models = {
    "logistic":      LogisticRegression(max_iter=10000, random_state=42),
    "decision_tree": DecisionTreeClassifier(random_state=42),
    "random_forest": RandomForestClassifier(n_estimators=100, random_state=42),
}

os.makedirs("models", exist_ok=True)
metrics_all = {}

for name, model in models.items():
    model.fit(X_train_sc, y_train)
    y_pred = model.predict(X_test_sc)
    y_prob = model.predict_proba(X_test_sc)[:, 1]

    metrics_all[name] = {
        "accuracy":  round(accuracy_score(y_test, y_pred)  * 100, 2),
        "precision": round(precision_score(y_test, y_pred) * 100, 2),
        "recall":    round(recall_score(y_test, y_pred)    * 100, 2),
        "f1":        round(f1_score(y_test, y_pred)        * 100, 2),
        "roc_auc":   round(roc_auc_score(y_test, y_prob)   * 100, 2),
    }

    joblib.dump(model, f"models/{name}_model.pkl")
    print(f"✅ {name} | Accuracy: {metrics_all[name]['accuracy']}%")

joblib.dump(scaler, "models/scaler.pkl")

with open("models/metrics.json", "w") as f:
    json.dump(metrics_all, f)

print("\n🎉 All models trained and saved in /models folder!")