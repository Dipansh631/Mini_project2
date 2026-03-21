"""
preprocessing.py
Utility functions for data preprocessing before passing to ML models.
"""

import numpy as np
import re

# ─────────────────────────────────────────────
# Stage encoding maps (matching the notebook training)
# ─────────────────────────────────────────────
STAGE_MAP = {
    "Lead": 0,
    "Qualified": 1,
    "Proposal": 2,
    "Negotiation": 3,
    "Closed": 4,
}

# Revenue model category map for BigMart-style features
ITEM_TYPE_MAP = {
    "Lead": 0,
    "Qualified": 1,
    "Proposal": 2,
    "Negotiation": 3,
    "Closed": 4,
}


def encode_stage(stage: str) -> int:
    """
    Converts a deal stage string to a numeric encoding.
    Falls back to 0 (Lead) if unknown stage is supplied.
    """
    return STAGE_MAP.get(stage, 0)


def normalize_revenue(value: float, max_value: float = 1_000_000.0) -> float:
    """
    Normalises raw revenue/deal value to a 0-100 scale.
    Clips at max_value to avoid outliers dominating the score.
    """
    clamped = min(max(float(value), 0.0), max_value)
    return (clamped / max_value) * 100.0


def build_deal_features(
    deal_value: float,
    stage: str,
    interactions: int,
) -> np.ndarray:
    """
    Builds a feature vector for the CRM Deal Outcome Prediction model.

    Parameters
    ----------
    deal_value   : Monetary value of the deal
    stage        : CRM pipeline stage string
    interactions : Number of past interactions with this client

    Returns
    -------
    np.ndarray shaped (1, 3) – [encoded_stage, deal_value, interactions]
    """
    encoded_stage = encode_stage(stage)
    features = np.array([[encoded_stage, float(deal_value), int(interactions)]])
    return features


def build_revenue_features(
    deal_value: float,
    stage: str,
    interactions: int,
) -> np.ndarray:
    """
    Builds a feature vector for the BigMart Revenue Prediction model.

    Parameters
    ----------
    deal_value   : Monetary value of the deal
    stage        : CRM pipeline stage string
    interactions : Number of past interactions

    Returns
    -------
    np.ndarray shaped (1, 3)
    """
    encoded_stage = encode_stage(stage)
    features = np.array([[float(deal_value), encoded_stage, float(interactions)]])
    return features


def clean_email_text(text: str) -> str:
    """
    Minimally cleans raw email text for the NLP sentiment model.
    Removes excess whitespace and non-printable characters.
    """
    text = re.sub(r"\s+", " ", text)          # collapse whitespace
    text = re.sub(r"[^\x20-\x7E]", "", text)  # strip non-ASCII
    return text.strip()


def compute_deal_score(
    success_probability: float,
    sentiment_score: float,
    deal_value: float,
    max_deal_value: float = 1_000_000.0,
) -> int:
    """
    Computes the composite deal score using the specified formula:
        deal_score = 0.5*(prob*100) + 0.3*(sentiment_score) + 0.2*(norm_revenue)

    Parameters
    ----------
    success_probability : float in [0, 1]
    sentiment_score     : float in [0, 100]
    deal_value          : raw deal value
    max_deal_value      : ceiling for normalisation (default 1 M)

    Returns
    -------
    Integer deal score in [0, 100]
    """
    norm_rev = normalize_revenue(deal_value, max_deal_value)
    score = (
        0.5 * (success_probability * 100)
        + 0.3 * sentiment_score
        + 0.2 * norm_rev
    )
    return int(round(min(max(score, 0), 100)))
