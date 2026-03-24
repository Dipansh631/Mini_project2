"""
app.py – AI Sales Intelligence & Deal Outcome Prediction Platform
FastAPI backend entry point.

Run with:
  uvicorn backend.app:app --reload --port 8000
"""

import logging
import os
from pathlib import Path

import joblib
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

load_dotenv()

from backend.schemas.request_schemas import (
    DealRequest, DealResponse,
    EmailRequest, EmailResponse,
    HealthResponse, InsightsResponse,
    DashboardStatsResponse, LeadsResponse,
    UserRoleResponse, DealUpdateRequest,
)
from backend.services.deal_service import predict_deal_outcome
from backend.services.insight_service import generate_insights
from backend.services.revenue_service import predict_revenue
from backend.services.sentiment_service import analyse_sentiment
from backend.services.supabase_service import (
    upsert_user, get_user_role,
    save_deal, get_all_deals, update_deal, delete_deal,
    get_dashboard_stats, get_leads_by_category,
    save_email,
)
from backend.utils.preprocessing import compute_deal_score

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "dipanshumaheshwari73698@gmail.com")

# ─────────────────────────────────────────────
# FastAPI application
# ─────────────────────────────────────────────
app = FastAPI(
    title="AI Sales Intelligence API",
    description="REST API for the AI-driven Sales Intelligence Platform.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# ML Model loading
# ─────────────────────────────────────────────
MODELS_DIR = Path(__file__).parent / "models"
_deal_model = None
_revenue_model = None
_sentiment_model = None


def _load_model(filename: str):
    path = MODELS_DIR / filename
    if not path.exists():
        logger.warning("Model file not found: %s – heuristic fallback active.", path)
        return None
    try:
        model = joblib.load(path)
        logger.info("✅  Loaded model: %s", filename)
        return model
    except Exception as exc:
        logger.error("Failed to load %s: %s", filename, exc)
        return None


@app.on_event("startup")
async def load_models():
    global _deal_model, _revenue_model, _sentiment_model
    logger.info("Loading ML models from %s …", MODELS_DIR)
    _deal_model = _load_model("deal_model.pkl")
    _revenue_model = _load_model("revenue_model.pkl")
    _sentiment_model = _load_model("sentiment_model.pkl")
    logger.info("Model loading complete.")


# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────
def _classify_lead(deal_score: int) -> str:
    if deal_score > 75:
        return "Hot Lead"
    if deal_score >= 50:
        return "Warm Lead"
    return "Cold Lead"


# ─────────────────────────────────────────────
# System
# ─────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    return HealthResponse(status="API running")


# ─────────────────────────────────────────────
# Auth / User
# ─────────────────────────────────────────────
@app.post("/auth/login", response_model=UserRoleResponse, tags=["Auth"])
async def handle_login(x_user_email: str = Header(..., alias="X-User-Email")):
    """
    Called by the frontend immediately after a successful Supabase Google login.
    Upserts the user into the `users` table and returns their role.
    """
    user_data = upsert_user(x_user_email)
    return UserRoleResponse(
        email=x_user_email,
        role=user_data.get("role", "user"),
    )


@app.get("/auth/user", response_model=UserRoleResponse, tags=["Auth"])
async def get_auth_user(x_user_email: str = Header(..., alias="X-User-Email")):
    """Return the stored role for the currently logged-in user."""
    role = get_user_role(x_user_email)
    return UserRoleResponse(email=x_user_email, role=role)


# ─────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────
@app.get("/dashboard-stats", response_model=DashboardStatsResponse, tags=["Dashboard"])
async def dashboard_stats():
    """Aggregate KPIs from the deals table."""
    try:
        stats = get_dashboard_stats()
        return DashboardStatsResponse(**stats)
    except Exception as exc:
        logger.exception("dashboard-stats error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────
# Leads
# ─────────────────────────────────────────────
@app.get("/leads", response_model=LeadsResponse, tags=["Leads"])
async def get_leads():
    """Return deals grouped by lead category (Hot / Warm / Cold)."""
    try:
        data = get_leads_by_category()
        return LeadsResponse(**data)
    except Exception as exc:
        logger.exception("leads error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────
# Deals CRUD
# ─────────────────────────────────────────────
@app.get("/deals", tags=["Deals"])
async def list_deals():
    """Return all deals (latest first)."""
    return get_all_deals()


@app.patch("/deals/{deal_id}", tags=["Deals"])
async def edit_deal(
    deal_id: str,
    payload: DealUpdateRequest,
    x_user_email: str = Header(..., alias="X-User-Email"),
):
    """Update a deal. Admin only."""
    if get_user_role(x_user_email) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    updated = update_deal(deal_id, payload.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Deal not found or update failed.")
    return updated


@app.delete("/deals/{deal_id}", tags=["Deals"])
async def remove_deal(
    deal_id: str,
    x_user_email: str = Header(..., alias="X-User-Email"),
):
    """Delete a deal. Admin only."""
    if get_user_role(x_user_email) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    ok = delete_deal(deal_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Deal not found or delete failed.")
    return {"detail": "Deal deleted."}


# ─────────────────────────────────────────────
# Predictions
# ─────────────────────────────────────────────
@app.post("/predict-deal", response_model=DealResponse, tags=["Predictions"])
async def predict_deal(payload: DealRequest):
    """
    Runs ML pipeline → saves result to Supabase → returns prediction.
    """
    try:
        success_probability, risk_level = predict_deal_outcome(
            model=_deal_model,
            deal_value=payload.deal_value,
            stage=payload.stage,
            interactions=payload.interactions,
        )
        predicted_revenue = predict_revenue(
            model=_revenue_model,
            deal_value=payload.deal_value,
            stage=payload.stage,
            interactions=payload.interactions,
        )
        sentiment_label = "Neutral"
        sentiment_score = 50
        if payload.email_text and payload.email_text.strip():
            sentiment_label, _, sentiment_score, _, _ = analyse_sentiment(
                model=_sentiment_model,
                email_text=payload.email_text,
            )
        deal_score = compute_deal_score(
            success_probability=success_probability,
            sentiment_score=float(sentiment_score),
            deal_value=payload.deal_value,
        )
        lead_category = _classify_lead(deal_score)

        # ── Persist to Supabase ───────────────────────────────────────────
        save_deal({
            "client_name": payload.client_name,
            "deal_value": payload.deal_value,
            "stage": payload.stage,
            "interactions": payload.interactions,
            "success_probability": round(success_probability, 4),
            "predicted_revenue": round(predicted_revenue, 2),
            "sentiment": sentiment_label,
            "sentiment_score": float(sentiment_score),
            "deal_score": float(deal_score),
            "risk_level": risk_level,
            "lead_category": lead_category,
        })

        logger.info("predict-deal | client=%s prob=%.2f score=%d",
                    payload.client_name, success_probability, deal_score)

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
    """Runs NLP sentiment analysis → saves to emails table → returns result."""
    try:
        sentiment, emotion, sentiment_score, suggestion, detected_keywords = analyse_sentiment(
            model=_sentiment_model,
            email_text=payload.email_text,
        )

        # ── Persist to Supabase ───────────────────────────────────────────
        save_email({
            "client_name": getattr(payload, "client_name", None),
            "email_text": payload.email_text,
            "sentiment": sentiment,
            "emotion": emotion,
            "sentiment_score": float(sentiment_score),
        })

        logger.info("analyze-email | sentiment=%s emotion=%s score=%d",
                    sentiment, emotion, sentiment_score)

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


# ─────────────────────────────────────────────
# Insights
# ─────────────────────────────────────────────
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
