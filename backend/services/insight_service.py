"""
insight_service.py
Generates AI-driven strategic insights by cross-analysing deal data.

Insights are rule-based but framed as concise, actionable intelligence.
The function can be called with optional context from the most recent
deal analysis to produce personalised insights in addition to global ones.
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


def generate_insights(
    success_probability: Optional[float] = None,
    deal_value: Optional[float] = None,
    sentiment: Optional[str] = None,
    sentiment_score: Optional[int] = None,
    interactions: Optional[int] = None,
    stage: Optional[str] = None,
    deal_score: Optional[int] = None,
) -> List[str]:
    """
    Produces a list of strategic insight strings based on deal context.

    Parameters
    ----------
    success_probability : float in [0,1] – ML predicted win probability
    deal_value          : Monetary deal value
    sentiment           : "Positive" | "Neutral" | "Negative"
    sentiment_score     : int 0-100
    interactions        : Past interaction count
    stage               : CRM pipeline stage
    deal_score          : Composite deal score 0-100

    Returns
    -------
    List[str] of insight statements (minimum 3, maximum 8)
    """
    insights: List[str] = []

    # ── High probability opportunities ───────────────────────────────────
    if success_probability is not None:
        if success_probability > 0.75:
            insights.append(
                f"High-probability deal ({int(success_probability * 100)}% win chance) – "
                "prioritise this in the weekly pipeline review."
            )
        elif success_probability < 0.35:
            insights.append(
                "Low win probability detected. Consider a re-qualification call "
                "to identify blockers before investing further resources."
            )

    # ── Risk alerts: negative sentiment + high value ──────────────────────
    if sentiment == "Negative" and deal_value and deal_value > 20_000:
        formatted = f"${deal_value:,.0f}"
        insights.append(
            f"High-value deal at risk: negative client sentiment on a {formatted} opportunity. "
            "Escalate to senior account manager immediately."
        )

    # ── Positive engagement signals ───────────────────────────────────────
    if sentiment == "Positive":
        insights.append(
            "Client engagement is strong – positive tone detected in communications. "
            "Now is the ideal time to accelerate the closing process."
        )

    # ── Follow-up reminder based on interaction count ─────────────────────
    if interactions is not None:
        if interactions == 0:
            insights.append(
                "No past interactions recorded. Start outreach with a personalised "
                "introduction deck to establish rapport."
            )
        elif interactions < 3:
            insights.append(
                f"Only {interactions} interaction(s) logged – follow up promptly "
                "to increase engagement before the lead goes cold."
            )

    # ── Deal score classification ─────────────────────────────────────────
    if deal_score is not None:
        if deal_score > 75:
            insights.append(
                f"Deal Score {deal_score}/100 → Hot Lead. Move aggressively to close."
            )
        elif deal_score > 50:
            insights.append(
                f"Deal Score {deal_score}/100 → Warm Lead. Nurture with targeted content."
            )
        else:
            insights.append(
                f"Deal Score {deal_score}/100 → Cold Lead. Revisit ICP fit before investing further."
            )

    # ── Stage-specific guidance ───────────────────────────────────────────
    if stage:
        stage_advice = {
            "Lead": "Prospect is still in the Lead stage – qualify BANT criteria to progress faster.",
            "Qualified": "Deal is qualified. Share a tailored ROI analysis to move to Proposal.",
            "Proposal": "Proposal sent – schedule a review call within 3 days to address questions.",
            "Negotiation": "In active negotiation. Prepare concession ladder before the next discussion.",
            "Closed": "Deal is closed. Onboard the client promptly to set the tone for the relationship.",
        }
        advice = stage_advice.get(stage)
        if advice:
            insights.append(advice)

    # ── Global baseline insights (always included) ────────────────────────
    global_insights = [
        "Track all client touchpoints in the CRM to maximise model prediction accuracy.",
        "High-sentiment deals close 2× faster – monitor email tone weekly.",
        "Deals with 5+ interactions show a 40% higher close rate on average.",
    ]

    # Fill up to at least 3 total insights without duplication
    for g in global_insights:
        if len(insights) >= 6:
            break
        if g not in insights:
            insights.append(g)

    return insights[:8]  # Cap at 8 for clean UI display
