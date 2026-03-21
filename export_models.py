"""
export_models.py
─────────────────────────────────────────────────────────────────────────────
IMPORTANT: Run this script ONLY if you do not have pre-trained .pkl files.
It trains lightweight placeholder models using synthetic data so the
FastAPI backend can load valid model files on startup.

This script NEVER touches the original Jupyter Notebooks.
Run from the Mini_project2-main\Mini_project2-main directory:

    python export_models.py

Output files (written to backend/models/):
    deal_model.pkl
    revenue_model.pkl
    sentiment_model.pkl
─────────────────────────────────────────────────────────────────────────────
"""

import os
import numpy as np
import joblib
from pathlib import Path

# ─────────────────────────────────────────────
# Output directory
# ─────────────────────────────────────────────
MODELS_DIR = Path(__file__).parent / "backend" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

print(f"Writing models to: {MODELS_DIR}\n")

# ─────────────────────────────────────────────
# 1. CRM Deal Outcome Model  (deals_model.pkl)
#    Features: [encoded_stage, deal_value, interactions]
#    Target  : win/loss binary (0 or 1)
# ─────────────────────────────────────────────
from sklearn.ensemble import GradientBoostingClassifier

np.random.seed(42)
N = 500

stages = np.random.randint(0, 5, N)            # 0=Lead … 4=Closed
deal_values = np.random.uniform(5_000, 500_000, N)
interactions = np.random.randint(0, 20, N)

# Labels: higher stage + more interactions → more likely to win
win_prob = (stages / 4) * 0.5 + (interactions / 20) * 0.3 + np.random.rand(N) * 0.2
labels = (win_prob > 0.5).astype(int)

X_deal = np.column_stack([stages, deal_values, interactions])
deal_model = GradientBoostingClassifier(n_estimators=50, random_state=42)
deal_model.fit(X_deal, labels)

joblib.dump(deal_model, MODELS_DIR / "deal_model.pkl")
print("✅  deal_model.pkl  saved")

# ─────────────────────────────────────────────
# 2. BigMart Revenue Prediction Model  (revenue_model.pkl)
#    Features: [deal_value, encoded_stage, interactions]
#    Target  : predicted revenue (continuous)
# ─────────────────────────────────────────────
from sklearn.ensemble import GradientBoostingRegressor

multipliers = np.array([0.60, 0.75, 0.85, 1.10, 1.20])[stages]
revenue = deal_values * multipliers + np.random.normal(0, 2000, N)
revenue = np.maximum(revenue, 0)

X_rev = np.column_stack([deal_values, stages, interactions])
revenue_model = GradientBoostingRegressor(n_estimators=50, random_state=42)
revenue_model.fit(X_rev, revenue)

joblib.dump(revenue_model, MODELS_DIR / "revenue_model.pkl")
print("✅  revenue_model.pkl  saved")

# ─────────────────────────────────────────────
# 3. Email Sentiment Analysis Model  (sentiment_model.pkl)
#    Input  : raw string
#    Output : 0=Negative, 1=Neutral, 2=Positive
# ─────────────────────────────────────────────
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Synthetic training corpus
positive_emails = [
    "We are very excited to move forward with this proposal.",
    "Great job on the presentation, we are impressed.",
    "Looking forward to signing the contract next week.",
    "The product demo was excellent and the team is on board.",
    "We appreciate your prompt response and quality of work.",
    "This is exactly what we needed, let us proceed.",
    "Happy with the service, ready to close the deal.",
    "Fantastic support, we will recommend you to others.",
    "The ROI is clearly visible, let us talk terms.",
    "Thank you for the detailed breakdown, very helpful.",
]

neutral_emails = [
    "We are still evaluating all the proposals on the table.",
    "Can you send additional information about the pricing?",
    "We need to discuss this internally before making a decision.",
    "How does this compare to other solutions in the market?",
    "Please schedule a follow-up meeting for next week.",
    "We have reviewed the proposal and have some questions.",
    "The timeline you proposed needs further clarification.",
    "We are considering your offer along with alternatives.",
    "Our team is currently reviewing the technical specifications.",
    "Could you provide a case study for a similar project?",
]

negative_emails = [
    "We are very disappointed with the delays in delivery.",
    "This does not meet our requirements at all.",
    "We have decided to cancel the agreement effective immediately.",
    "The issues have not been resolved despite multiple follow-ups.",
    "This is completely unacceptable and we expect a refund.",
    "The service quality has been poor and we are frustrated.",
    "We are considering switching to a different provider.",
    "There are too many problems with the current implementation.",
    "We did not agree to these terms and need immediate review.",
    "The project is behind schedule and over budget, this is a problem.",
]

texts = positive_emails + neutral_emails + negative_emails
labels_sentiment = [2] * 10 + [1] * 10 + [0] * 10  # 2=Positive, 1=Neutral, 0=Negative

sentiment_model = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=500, ngram_range=(1, 2))),
    ("clf", LogisticRegression(max_iter=500, random_state=42)),
])
sentiment_model.fit(texts, labels_sentiment)

joblib.dump(sentiment_model, MODELS_DIR / "sentiment_model.pkl")
print("✅  sentiment_model.pkl  saved")

print("\n✅  All models exported successfully to backend/models/")
print("   Run the API with: uvicorn backend.app:app --reload --port 8000")
