"""
deal_service.py
Business logic for CRM Deal Outcome Prediction.

Loads the trained deal_model.pkl at module import time so it is
ready for every request without reloading overhead.
"""

import logging
from typing import Tuple

from backend.utils.preprocessing import build_deal_features

logger = logging.getLogger(__name__)


def predict_deal_outcome(model, deal_value: float, stage: str, interactions: int) -> Tuple[float, str]:
    """
    Runs the CRM deal prediction model and applies the risk-level rules.

    Parameters
    ----------
    model        : Loaded sklearn/joblib model object (loaded once at startup)
    deal_value   : Monetary value of the deal
    stage        : Pipeline stage string
    interactions : Past interaction count

    Returns
    -------
    (success_probability, risk_level)
        success_probability – float in [0, 1]
        risk_level          – one of "Low" | "Medium" | "High"
    """
    try:
        features = build_deal_features(deal_value, stage, interactions)

        # Use predict_proba if the model supports it, else predict
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(features)[0]
            # Class ordering: assume index 1 = positive/won
            success_probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
        else:
            success_probability = float(model.predict(features)[0])

        # Clamp to valid range
        success_probability = max(0.0, min(1.0, success_probability))

    except Exception as exc:
        logger.warning("CRM model inference failed (%s); using heuristic fallback.", exc)
        # Heuristic fallback based on deal stage and interactions
        success_probability = _heuristic_probability(stage, interactions)

    risk_level = _classify_risk(success_probability)
    return success_probability, risk_level


def _heuristic_probability(stage: str, interactions: int) -> float:
    """
    Simple rule-based fallback used when the ML model is unavailable.
    Combines stage progress weight with interaction count signal.
    """
    stage_weights = {
        "Lead": 0.20,
        "Qualified": 0.40,
        "Proposal": 0.55,
        "Negotiation": 0.70,
        "Closed": 0.90,
    }
    base = stage_weights.get(stage, 0.30)
    # Interaction bonus caps at +0.20
    interaction_bonus = min(interactions * 0.02, 0.20)
    return min(base + interaction_bonus, 1.0)


def _classify_risk(success_probability: float) -> str:
    """
    Maps a success probability to a risk level string.

    Rules:
        > 0.7  → Low Risk
        0.4-0.7→ Medium Risk
        < 0.4  → High Risk
    """
    if success_probability > 0.70:
        return "Low"
    if success_probability >= 0.40:
        return "Medium"
    return "High"
