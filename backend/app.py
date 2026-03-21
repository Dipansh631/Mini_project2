"""
app.py – AI Sales Intelligence & Deal Outcome Prediction Platform
FastAPI backend entry point.

Startup sequence:
  1. Load ML models from disk (models/*.pkl) once
  2. Expose CORS for React frontend
  3. Register all route handlers

Run with:
  uvicorn backend.app:app --reload --port 8000
"""

import logging
import os
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas.request_schemas import (
    DealRequest,
    DealResponse,
    EmailRequest,
    EmailResponse,
    HealthResponse,
    InsightsResponse,
)
from backend.services.deal_service import predict_deal_outcome
from backend.services.insight_service import generate_insights
from backend.services.revenue_service import predict_revenue
from backend.services.sentiment_service import analyse_sentiment
from backend.utils.preprocessing import compute_deal_score

# ─────────────────────────────────────────────
# Logging configuration
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# FastAPI application instance
# ─────────────────────────────────────────────
app = FastAPI(
    title="AI Sales Intelligence API",
    description=(
        "REST API powering the AI-driven Sales Intelligence and Deal Outcome "
        "Prediction Platform. Integrates CRM outcome prediction, BigMart revenue "
        "forecasting, and NLP email sentiment analysis."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
# CORS – allow React frontend on any local origin
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # open for development; tighten in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Model storage – loaded once at startup
# ─────────────────────────────────────────────
MODELS_DIR = Path(__file__).parent / "models"

_deal_model = None
_revenue_model = None
_sentiment_model = None


def _load_model(filename: str):
    """
    Attempts to load a joblib/pickle model from the models directory.
    Returns None if the file is not present (graceful degradation).
    """
    model_path = MODELS_DIR / filename
    if not model_path.exists():
        logger.warning("Model file not found: %s – falling back to heuristics.", model_path)
        return None
    try:
        model = joblib.load(model_path)
        logger.info("✅  Loaded model: %s", filename)
        return model
    except Exception as exc:
        logger.error("Failed to load %s: %s – falling back to heuristics.", filename, exc)
        return None


@app.on_event("startup")
async def load_models():
    """Load all ML models once when the server starts."""
    global _deal_model, _revenue_model, _sentiment_model
    logger.info("Loading ML models from %s …", MODELS_DIR)
    _deal_model = _load_model("deal_model.pkl")
    _revenue_model = _load_model("revenue_model.pkl")
    _sentiment_model = _load_model("sentiment_model.pkl")
    logger.info("Model loading complete. (None = heuristic fallback active)")


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health-check endpoint used by load balancers and React frontend
    to verify the API is alive.
    """
    return HealthResponse(status="API running")


@app.post("/predict-deal", response_model=DealResponse, tags=["Predictions"])
async def predict_deal(payload: DealRequest):
    """
    Combines the CRM deal outcome model, BigMart revenue model, and
    (optionally) inline email sentiment to produce a composite deal score.

    Formula:
        deal_score = 0.5*(success_probability*100)
                   + 0.3*(sentiment_score)
                   + 0.2*(normalised_revenue)
    """
    try:
        # ── 1. CRM Deal Model → success probability + risk level ──────────
        success_probability, risk_level = predict_deal_outcome(
            model=_deal_model,
            deal_value=payload.deal_value,
            stage=payload.stage,
            interactions=payload.interactions,
        )

        # ── 2. BigMart Revenue Model → predicted revenue ──────────────────
        predicted_revenue = predict_revenue(
            model=_revenue_model,
            deal_value=payload.deal_value,
            stage=payload.stage,
            interactions=payload.interactions,
        )

        # ── 3. Optional inline sentiment scoring ──────────────────────────
        sentiment_score = 50  # neutral default
        if payload.email_text and payload.email_text.strip():
            _, _, sentiment_score, _, _ = analyse_sentiment(
                model=_sentiment_model,
                email_text=payload.email_text,
            )

        # ── 4. Composite deal score ────────────────────────────────────────
        deal_score = compute_deal_score(
            success_probability=success_probability,
            sentiment_score=float(sentiment_score),
            deal_value=payload.deal_value,
        )

        # ── 5. Lead category ──────────────────────────────────────────────
        lead_category = _classify_lead(deal_score)

        logger.info(
            "predict-deal | client=%s prob=%.2f rev=%.0f score=%d",
            payload.client_name,
            success_probability,
            predicted_revenue,
            deal_score,
        )

        return DealResponse(
            client_name=payload.client_name,
            success_probability=round(success_probability, 4),
            risk_level=risk_level,
            predicted_revenue=round(predicted_revenue, 2),
            deal_score=deal_score,
            lead_category=lead_category,
        )

    except Exception as exc:
        logger.exception("Unhandled error in /predict-deal: %s", exc)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}")


@app.post("/analyze-email", response_model=EmailResponse, tags=["Predictions"])
async def analyze_email(payload: EmailRequest):
    """
    Runs the NLP Email Sentiment Analysis model on the provided email text.
    Returns detected sentiment, dominant emotion, confidence score,
    and an AI-generated follow-up suggestion.
    """
    try:
        sentiment, emotion, sentiment_score, suggestion, detected_keywords = analyse_sentiment(
            model=_sentiment_model,
            email_text=payload.email_text,
        )

        logger.info(
            "analyze-email | sentiment=%s emotion=%s score=%d",
            sentiment,
            emotion,
            sentiment_score,
        )

        return EmailResponse(
            sentiment=sentiment,
            emotion=emotion,
            sentiment_score=sentiment_score,
            suggestion=suggestion,
            detected_keywords=detected_keywords,
        )

    except Exception as exc:
        logger.exception("Unhandled error in /analyze-email: %s", exc)
        raise HTTPException(status_code=500, detail=f"Email analysis failed: {str(exc)}")


@app.get("/get-insights", response_model=InsightsResponse, tags=["Insights"])
async def get_insights(
    success_probability: float = None,
    deal_value: float = None,
    sentiment: str = None,
    sentiment_score: int = None,
    interactions: int = None,
    stage: str = None,
    deal_score: int = None,
):
    """
    Generates AI-driven strategic insights.

    All query parameters are optional. When provided they personalise the
    insights to the specific deal; without parameters a set of global
    pipeline-health insights is returned.
    """
    try:
        insights = generate_insights(
            success_probability=success_probability,
            deal_value=deal_value,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            interactions=interactions,
            stage=stage,
            deal_score=deal_score,
        )

        logger.info("get-insights | generated %d insights", len(insights))
        return InsightsResponse(insights=insights)

    except Exception as exc:
        logger.exception("Unhandled error in /get-insights: %s", exc)
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(exc)}")


# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────

def _classify_lead(deal_score: int) -> str:
    """
    Classifies a deal into a lead category based on composite score.

        > 75  → Hot Lead
        50-75 → Warm Lead
        < 50  → Cold Lead
    """
    if deal_score > 75:
        return "Hot Lead"
    if deal_score >= 50:
        return "Warm Lead"
    return "Cold Lead"
