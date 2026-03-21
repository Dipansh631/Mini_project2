"""
request_schemas.py
Pydantic models for all API request and response payloads.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ─────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────

class DealRequest(BaseModel):
    """Input payload for the POST /predict-deal endpoint."""
    client_name: str = Field(..., example="ABC Corp", description="Name of the client company")
    deal_value: float = Field(..., gt=0, example=50000, description="Monetary value of the deal in USD")
    stage: str = Field(
        default="Lead",
        example="Negotiation",
        description="Current CRM pipeline stage: Lead | Qualified | Proposal | Negotiation | Closed",
    )
    interactions: int = Field(..., ge=0, example=5, description="Number of past interactions with the client")
    email_text: Optional[str] = Field(
        default="",
        example="We are looking forward to finalising the agreement.",
        description="Optional recent email text for inline sentiment scoring",
    )


class EmailRequest(BaseModel):
    """Input payload for the POST /analyze-email endpoint."""
    email_text: str = Field(
        ...,
        min_length=1,
        example="We are interested but need a better price.",
        description="Raw email body to analyse for sentiment and emotion",
    )


# ─────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────

class DealResponse(BaseModel):
    """Output payload returned by POST /predict-deal."""
    client_name: str
    success_probability: float = Field(..., description="ML-predicted probability of deal success (0-1)")
    risk_level: str = Field(..., description="Risk classification: Low | Medium | High")
    predicted_revenue: float = Field(..., description="BigMart-model predicted expected revenue")
    deal_score: int = Field(..., description="Composite deal score 0-100")
    lead_category: str = Field(..., description="Lead category: Hot | Warm | Cold")


class EmailResponse(BaseModel):
    """Output payload returned by POST /analyze-email."""
    sentiment: str = Field(..., description="Overall sentiment: Positive | Neutral | Negative")
    emotion: str = Field(..., description="Dominant detected emotion")
    sentiment_score: int = Field(..., description="Sentiment confidence score 0-100")
    suggestion: str = Field(..., description="AI-generated actionable suggestion for the sales team")
    detected_keywords: Optional[List[str]] = Field(default=[], description="Key trigger words detected in the email")


class InsightsResponse(BaseModel):
    """Output payload returned by GET /get-insights."""
    insights: List[str] = Field(..., description="List of AI-generated strategic insight strings")


class HealthResponse(BaseModel):
    """Output payload returned by GET /health."""
    status: str = "API running"
