"""
supabase_service.py
All Supabase database operations for the Sales Intelligence backend.
Uses the service-role key so it bypasses Row Level Security (RLS).
"""

import logging
import os
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL          = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
ADMIN_EMAIL           = os.getenv("ADMIN_EMAIL", "dipanshumaheshwari73698@gmail.com")


@lru_cache(maxsize=1)
def _get_client() -> Optional[Client]:
    """Returns a cached Supabase client (service-role). Returns None if not configured."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("Supabase not configured – DB persistence disabled.")
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as exc:
        logger.error("Supabase client init failed: %s", exc)
        return None


# ─────────────────────────────────────────────────────────────────
# Auth / User management
# ─────────────────────────────────────────────────────────────────

def upsert_user(email: str) -> dict:
    """
    Insert user on first Google login; update nothing if already exists.
    Assigns admin role if email matches ADMIN_EMAIL.
    """
    db = _get_client()
    if db is None:
        return {"email": email, "role": "admin" if email == ADMIN_EMAIL else "user"}
    role = "admin" if email == ADMIN_EMAIL else "user"
    try:
        result = (
            db.table("users")
            .upsert({"email": email, "role": role}, on_conflict="email")
            .execute()
        )
        data = result.data[0] if result.data else {"email": email, "role": role}
        return data
    except Exception as exc:
        logger.error("upsert_user error: %s", exc)
        return {"email": email, "role": role}


def get_user_role(email: str) -> str:
    """Return the stored role for a given user email."""
    db = _get_client()
    if db is None:
        return "admin" if email == ADMIN_EMAIL else "user"
    try:
        result = db.table("users").select("role").eq("email", email).single().execute()
        return result.data.get("role", "user") if result.data else "user"
    except Exception:
        return "admin" if email == ADMIN_EMAIL else "user"


# ─────────────────────────────────────────────────────────────────
# Deals
# ─────────────────────────────────────────────────────────────────

def save_deal(payload: dict) -> Optional[dict]:
    """Insert a deal prediction result into the deals table."""
    db = _get_client()
    if db is None:
        logger.debug("Supabase not configured – deal not persisted.")
        return None
    try:
        result = db.table("deals").insert(payload).execute()
        return result.data[0] if result.data else None
    except Exception as exc:
        logger.error("save_deal error: %s", exc)
        return None


def get_all_deals() -> list:
    """Fetch all deals ordered by created_at desc."""
    db = _get_client()
    if db is None:
        return []
    try:
        result = db.table("deals").select("*").order("created_at", desc=True).execute()
        return result.data or []
    except Exception as exc:
        logger.error("get_all_deals error: %s", exc)
        return []


def update_deal(deal_id: str, payload: dict) -> Optional[dict]:
    """Update fields of an existing deal (admin only)."""
    db = _get_client()
    if db is None:
        return None
    try:
        result = db.table("deals").update(payload).eq("id", deal_id).execute()
        return result.data[0] if result.data else None
    except Exception as exc:
        logger.error("update_deal error: %s", exc)
        return None


def delete_deal(deal_id: str) -> bool:
    """Delete a deal by ID (admin only)."""
    db = _get_client()
    if db is None:
        return False
    try:
        db.table("deals").delete().eq("id", deal_id).execute()
        return True
    except Exception as exc:
        logger.error("delete_deal error: %s", exc)
        return False


def get_dashboard_stats() -> dict:
    """Aggregate stats from the deals table for the dashboard."""
    db = _get_client()
    if db is None:
        return {
            "total_deals": 0,
            "avg_success_probability": 0.0,
            "total_predicted_revenue": 0.0,
            "sentiment_distribution": {"Positive": 0, "Neutral": 0, "Negative": 0},
        }
    try:
        deals = db.table("deals").select("*").execute().data or []
        total = len(deals)
        avg_prob = (
            sum(d.get("success_probability", 0) or 0 for d in deals) / total
            if total else 0.0
        )
        total_rev = sum(d.get("predicted_revenue", 0) or 0 for d in deals)
        sentiment_dist: dict = {"Positive": 0, "Neutral": 0, "Negative": 0}
        for d in deals:
            s = d.get("sentiment") or "Neutral"
            sentiment_dist[s] = sentiment_dist.get(s, 0) + 1
        return {
            "total_deals": total,
            "avg_success_probability": round(avg_prob, 4),
            "total_predicted_revenue": round(total_rev, 2),
            "sentiment_distribution": sentiment_dist,
        }
    except Exception as exc:
        logger.error("get_dashboard_stats error: %s", exc)
        return {
            "total_deals": 0,
            "avg_success_probability": 0.0,
            "total_predicted_revenue": 0.0,
            "sentiment_distribution": {},
        }


def get_leads_by_category() -> dict:
    """Return deals grouped into Hot / Warm / Cold categories."""
    db = _get_client()
    if db is None:
        return {"hot": [], "warm": [], "cold": []}
    try:
        deals = db.table("deals").select("*").order("deal_score", desc=True).execute().data or []
        result = {"hot": [], "warm": [], "cold": []}
        for d in deals:
            cat = (d.get("lead_category") or "").lower()
            if "hot" in cat:
                result["hot"].append(d)
            elif "warm" in cat:
                result["warm"].append(d)
            else:
                result["cold"].append(d)
        return result
    except Exception as exc:
        logger.error("get_leads_by_category error: %s", exc)
        return {"hot": [], "warm": [], "cold": []}


# ─────────────────────────────────────────────────────────────────
# Emails
# ─────────────────────────────────────────────────────────────────

def save_email(payload: dict) -> Optional[dict]:
    """Insert a sentiment analysis result into the emails table."""
    db = _get_client()
    if db is None:
        return None
    try:
        result = db.table("emails").insert(payload).execute()
        return result.data[0] if result.data else None
    except Exception as exc:
        logger.error("save_email error: %s", exc)
        return None
