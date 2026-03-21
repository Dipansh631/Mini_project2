"""
revenue_service.py
Business logic for BigMart Revenue / Sales Prediction.

Loads the trained revenue_model.pkl at module import time.
"""

import logging
from backend.utils.preprocessing import build_revenue_features

logger = logging.getLogger(__name__)


def predict_revenue(model, deal_value: float, stage: str, interactions: int) -> float:
    """
    Runs the BigMart revenue prediction model to estimate expected revenue.

    Parameters
    ----------
    model        : Loaded sklearn/joblib model object
    deal_value   : Raw deal value in USD
    stage        : CRM pipeline stage
    interactions : Past interaction count

    Returns
    -------
    Predicted float revenue value (never negative)
    """
    try:
        features = build_revenue_features(deal_value, stage, interactions)
        predicted = float(model.predict(features)[0])
        # Revenue can never be negative
        return max(0.0, predicted)

    except Exception as exc:
        logger.warning("Revenue model inference failed (%s); using heuristic fallback.", exc)
        return _heuristic_revenue(deal_value, stage)


def _heuristic_revenue(deal_value: float, stage: str) -> float:
    """
    Rule-based fallback that estimates revenue when the ML model is unavailable.
    Revenue is estimated as deal_value × stage_multiplier.
    """
    stage_multipliers = {
        "Lead": 0.60,
        "Qualified": 0.75,
        "Proposal": 0.85,
        "Negotiation": 1.10,
        "Closed": 1.20,
    }
    multiplier = stage_multipliers.get(stage, 0.80)
    return round(deal_value * multiplier, 2)
