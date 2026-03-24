"""
request_schemas.py
Pydantic models for all API request and response payloads.
"""

from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


# ─────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────

class DealRequest(BaseModel):
    client_name: str = Field(..., example="ABC Corp")
    deal_value: float = Field(..., gt=0, example=50000)
    stage: str = Field(default="Lead", example="Negotiation")
    interactions: int = Field(..., ge=0, example=5)
    email_text: Optional[str] = Field(default="", example="We are excited to proceed.")


class EmailRequest(BaseModel):
    email_text: str = Field(..., min_length=1)
    client_name: Optional[str] = Field(default=None)


class DealUpdateRequest(BaseModel):
    """Fields that can be patched on an existing deal (all optional)."""
    client_name: Optional[str]   = None
    deal_value: Optional[float]  = None
    stage: Optional[str]         = None
    interactions: Optional[int]  = None


# ─────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────

class DealResponse(BaseModel):
    client_name: str
    success_probability: float
    risk_level: str
    predicted_revenue: float
    deal_score: int
    lead_category: str


class EmailResponse(BaseModel):
    sentiment: str
    emotion: str
    sentiment_score: int
    suggestion: str
    detected_keywords: Optional[List[str]] = []


class InsightsResponse(BaseModel):
    insights: List[str]


class HealthResponse(BaseModel):
    status: str = "API running"


class UserRoleResponse(BaseModel):
    email: str
    role: str   # "admin" | "user"


class DashboardStatsResponse(BaseModel):
    total_deals: int
    avg_success_probability: float
    total_predicted_revenue: float
    sentiment_distribution: Dict[str, Any] = {}


class LeadsResponse(BaseModel):
    hot: List[Dict[str, Any]] = []
    warm: List[Dict[str, Any]] = []
    cold: List[Dict[str, Any]] = []
