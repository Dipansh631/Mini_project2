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
    Everyone is assigned role 'user' (admin features disabled for now).
    """
    db = _get_client()
    if db is None:
        return {"email": email, "role": "user", "organization": None}
    role = "user"   # Admin features disabled — everyone logs in as user
    try:
        result = (
            db.table("users")
            .upsert({"email": email, "role": role}, on_conflict="email")
            .execute()
        )
        data = result.data[0] if result.data else {"email": email, "role": role, "organization": None}
        return data
    except Exception as exc:
        logger.error("upsert_user error: %s", exc)
        return {"email": email, "role": role, "organization": None}


def get_user_role(email: str) -> str:
    """Return the stored role for a given user email (always 'user' while admin is disabled)."""
    db = _get_client()
    if db is None:
        return "user"
    try:
        result = db.table("users").select("role").eq("email", email).single().execute()
        return result.data.get("role", "user") if result.data else "user"
    except Exception:
        return "user"


def get_user_data(email: str) -> dict:
    """Return role + organization for a given user email."""
    db = _get_client()
    if db is None:
        return {"role": "admin" if email == ADMIN_EMAIL else "user", "organization": None}
    try:
        result = db.table("users").select("role, organization").eq("email", email).single().execute()
        return result.data if result.data else {"role": "user", "organization": None}
    except Exception:
        return {"role": "admin" if email == ADMIN_EMAIL else "user", "organization": None}


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
        trends_map = {}
        
        for d in deals:
            s = d.get("sentiment") or "Neutral"
            sentiment_dist[s] = sentiment_dist.get(s, 0) + 1
            
            # Trend mapping by date
            date_str = d.get("created_at", "")[:10]  # Extract YYYY-MM-DD
            if date_str:
                trends_map[date_str] = trends_map.get(date_str, 0) + (d.get("predicted_revenue", 0) or 0)
                
        # Format trends for frontend chart
        revenue_trends = [{"date": k, "revenue": round(v, 2)} for k, v in sorted(trends_map.items())]

        return {
            "total_deals": total,
            "avg_success_probability": round(avg_prob, 4),
            "total_predicted_revenue": round(total_rev, 2),
            "sentiment_distribution": sentiment_dist,
            "revenue_trends": revenue_trends,
        }
    except Exception as exc:
        logger.error("get_dashboard_stats error: %s", exc)
        return {
            "total_deals": 0,
            "avg_success_probability": 0.0,
            "total_predicted_revenue": 0.0,
            "sentiment_distribution": {},
            "revenue_trends": [],
        }


def get_leads_by_category() -> dict:
    """Return deals grouped into Hot / Warm / Cold categories based on probability."""
    db = _get_client()
    if db is None:
        return {"hot": [], "warm": [], "cold": []}
    try:
        # Order by success_probability desc instead of raw deal_score
        deals = db.table("deals").select("*").order("success_probability", desc=True).execute().data or []
        result = {"hot": [], "warm": [], "cold": []}
        
        for d in deals:
            prob = d.get("success_probability", 0) or 0
            
            # Dynamically categorize based on raw probability instead of relying on string field
            if prob >= 0.70:
                result["hot"].append(d)
            elif prob >= 0.40:
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


# ─────────────────────────────────────────────────────────────────
# User History
# ─────────────────────────────────────────────────────────────────

def log_user_action(email: str, action: str, details: dict) -> None:
    """
    Append a row to user_history.
    Called by the backend after every deal prediction or email analysis.
    The service-role key bypasses RLS so this always succeeds.
    """
    db = _get_client()
    if db is None:
        return
    try:
        db.table("user_history").insert({
            "user_email": email,
            "action": action,
            "details": details,
        }).execute()
        logger.info("user_history | logged action='%s' for %s", action, email)
    except Exception as exc:
        logger.error("log_user_action error: %s", exc)


def get_user_history(email: str, is_admin: bool = False) -> list:
    """
    Fetch history rows.
    - Regular users get only their own rows (filtered in DB via RLS, but
      we also filter here as a double safeguard).
    - Admins receive all rows when is_admin=True.
    """
    db = _get_client()
    if db is None:
        return []
    try:
        query = db.table("user_history").select("*").order("created_at", desc=True)
        if not is_admin:
            query = query.eq("user_email", email)
        result = query.execute()
        return result.data or []
    except Exception as exc:
        logger.error("get_user_history error: %s", exc)
        return []


# ─────────────────────────────────────────────────────────────────
# Admin Credentials (Admin Gate)
# ─────────────────────────────────────────────────────────────────

def _generate_admin_creds(full_name: str, dob_str: str) -> tuple[str, str]:
    """
    Deterministic credential generator.
    username = first_name (lowercase) + DOB year
    password = DOB_year + age + username_char_count + @salesdeal
    """
    from datetime import date
    dob = date.fromisoformat(dob_str)
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    first_name = full_name.strip().split()[0].lower()
    username = f"{first_name}{dob.year}"
    password = f"{dob.year}{age}{len(username)}@salesdeal"
    return username, password


def apply_for_admin(email: str, full_name: str, dob: str, organization: str) -> dict:
    """
    Creates an admin_credentials record and promotes the user to admin.
    Returns generated username & password.
    Raises ValueError if the email already has a pending/approved application.
    """
    db = _get_client()
    username, password = _generate_admin_creds(full_name, dob)

    if db is None:
        return {"username": username, "password": password}

    try:
        # Check for existing record
        existing = db.table("admin_credentials").select("status").eq("email", email).execute()
        if existing.data:
            status = existing.data[0].get("status", "pending")
            if status == "approved":
                raise ValueError("Already an approved admin.")
            if status == "pending":
                raise ValueError("Application already submitted and pending approval.")
            # rejected – allow re-apply by deleting old record
            db.table("admin_credentials").delete().eq("email", email).execute()

        # Insert new record
        db.table("admin_credentials").insert({
            "email":        email,
            "full_name":    full_name,
            "dob":          dob,
            "username":     username,
            "password":     password,
            "organization": organization,
            "status":       "approved",
        }).execute()

        # Promote user to admin + set org in users table
        db.table("users").upsert(
            {"email": email, "role": "admin", "organization": organization},
            on_conflict="email"
        ).execute()

        logger.info("apply_for_admin | approved email=%s username=%s", email, username)
        return {"username": username, "password": password}

    except ValueError:
        raise
    except Exception as exc:
        logger.error("apply_for_admin error: %s", exc)
        raise RuntimeError(str(exc))


def verify_admin_credentials(email: str, username: str, password: str) -> bool:
    """Checks the admin_credentials table for a matching row."""
    db = _get_client()
    if db is None:
        return False
    try:
        result = (
            db.table("admin_credentials")
            .select("id")
            .eq("email",    email)
            .eq("username", username)
            .eq("password", password)
            .eq("status",   "approved")
            .execute()
        )
        return bool(result.data)
    except Exception as exc:
        logger.error("verify_admin_credentials error: %s", exc)
        return False


def get_admin_cred_by_email(email: str) -> Optional[dict]:
    """Returns stored admin_credentials row for a given email, or None."""
    db = _get_client()
    if db is None:
        return None
    try:
        result = (
            db.table("admin_credentials")
            .select("username, status, organization")
            .eq("email", email)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as exc:
        logger.error("get_admin_cred_by_email error: %s", exc)
        return None


def set_user_org(email: str, organization: str) -> None:
    """Set or update the organization for a regular user."""
    db = _get_client()
    if db is None:
        return
    try:
        db.table("users").upsert(
            {"email": email, "organization": organization},
            on_conflict="email"
        ).execute()
        logger.info("set_user_org | %s → %s", email, organization)
    except Exception as exc:
        logger.error("set_user_org error: %s", exc)


def get_org_users(admin_email: str) -> list:
    """
    Returns all users belonging to the same organization as the admin.
    Looks up admin's org from admin_credentials, then fetches matching users.
    """
    db = _get_client()
    if db is None:
        return []
    try:
        # Get admin's organization
        cred = db.table("admin_credentials").select("organization").eq("email", admin_email).execute()
        if not cred.data:
            return []
        org = cred.data[0]["organization"]

        # Fetch users in same org
        result = (
            db.table("users")
            .select("email, role, organization, created_at")
            .eq("organization", org)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []
    except Exception as exc:
        logger.error("get_org_users error: %s", exc)
        return []
