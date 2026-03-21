"""
sentiment_service.py
Business logic for Email Sentiment & Emotion Analysis (NLP model).

Loads sentiment_model.pkl at module import time.
The model is expected to expose a predict() method on cleaned text strings.
If the model returns a numeric class (0=Negative, 1=Neutral, 2=Positive),
this service maps the class to human-readable labels and advice.
"""

import logging
import re
from typing import Tuple, List

from backend.utils.preprocessing import clean_email_text

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Keyword banks used by the heuristic fallback
# ─────────────────────────────────────────────
_POSITIVE_KEYWORDS = [
    "great", "excellent", "happy", "interested", "love", "perfect", "yes",
    "agree", "forward", "excited", "wonderful", "pleased", "fantastic",
    "appreciate", "thank", "looks good", "confirmed", "deal",
]

_NEGATIVE_KEYWORDS = [
    "cancel", "issue", "problem", "frustrated", "disappointed", "unhappy",
    "concern", "delay", "bad", "poor", "unacceptable", "reject", "no",
    "quit", "terrible", "worse", "angry", "fail",
]

# Emotion vocabulary
_POSITIVE_EMOTIONS = ["Interested", "Eager", "Enthusiastic", "Delighted"]
_NEUTRAL_EMOTIONS = ["Curious", "Attentive", "Contemplative"]
_NEGATIVE_EMOTIONS = ["Frustrated", "Concerned", "Disappointed", "Anxious"]

# AI suggestions indexed by sentiment
_SUGGESTIONS = {
    "Positive": "Client engagement is strong. Send the proposal or final contract now to capitalise on momentum.",
    "Neutral": "Client is evaluating options. Share a detailed case study and follow up within 48 hours.",
    "Negative": "Negative tone detected. Arrange an immediate call to address concerns before the deal stalls.",
}


def _extract_keywords(text: str) -> List[str]:
    """Returns which positive/negative trigger keywords appear in the text."""
    lower = text.lower()
    found = [kw for kw in _POSITIVE_KEYWORDS + _NEGATIVE_KEYWORDS if kw in lower]
    return found[:8]  # cap list length for clean output


def analyse_sentiment(model, email_text: str) -> Tuple[str, str, int, str, List[str]]:
    """
    Runs the NLP sentiment model on the supplied email text.

    Parameters
    ----------
    model      : Loaded ML model (sklearn Pipeline, or any object with .predict())
    email_text : Raw email body string

    Returns
    -------
    (sentiment, emotion, sentiment_score, suggestion, detected_keywords)
        sentiment       – "Positive" | "Neutral" | "Negative"
        emotion         – Dominant emotion string
        sentiment_score – int 0-100
        suggestion      – Actionable recommendation string
        detected_keywords – List of trigger keyword strings
    """
    cleaned = clean_email_text(email_text)

    try:
        # Most sklearn text pipelines accept a list of strings
        prediction = model.predict([cleaned])[0]

        # Map numeric or string output to canonical label
        if prediction in (2, "2", "positive", "Positive", 1, "1"):
            sentiment = "Positive"
        elif prediction in (0, "0", "negative", "Negative", -1, "-1"):
            sentiment = "Negative"
        else:
            sentiment = "Neutral"

        # Derive confidence score from predict_proba if available
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba([cleaned])[0]
            sentiment_score = int(round(max(proba) * 100))
        else:
            sentiment_score = _heuristic_score(cleaned, sentiment)

    except Exception as exc:
        logger.warning("Sentiment model inference failed (%s); using heuristic.", exc)
        sentiment, sentiment_score = _heuristic_sentiment(cleaned)

    emotion = _map_emotion(cleaned, sentiment)
    suggestion = _build_suggestion(cleaned, sentiment)
    detected_keywords = _extract_keywords(cleaned)

    return sentiment, emotion, sentiment_score, suggestion, detected_keywords


# ─────────────────────────────────────────────
# Heuristic helpers (fallback when model fails)
# ─────────────────────────────────────────────

def _heuristic_sentiment(text: str) -> Tuple[str, int]:
    """Keyword-based sentiment fallback returning (label, score)."""
    lower = text.lower()
    pos_hits = sum(1 for kw in _POSITIVE_KEYWORDS if kw in lower)
    neg_hits = sum(1 for kw in _NEGATIVE_KEYWORDS if kw in lower)

    if pos_hits > neg_hits:
        score = min(60 + pos_hits * 5, 95)
        return "Positive", score
    if neg_hits > pos_hits:
        score = min(60 + neg_hits * 5, 95)
        return "Negative", score
    return "Neutral", 50


def _heuristic_score(text: str, sentiment: str) -> int:
    """Rough confidence score when predict_proba is not available."""
    lower = text.lower()
    if sentiment == "Positive":
        hits = sum(1 for kw in _POSITIVE_KEYWORDS if kw in lower)
    elif sentiment == "Negative":
        hits = sum(1 for kw in _NEGATIVE_KEYWORDS if kw in lower)
    else:
        hits = 0
    return min(55 + hits * 5, 95)


def _map_emotion(text: str, sentiment: str) -> str:
    """Maps a text + sentiment pair to a specific emotion label."""
    lower = text.lower()
    if sentiment == "Positive":
        if any(w in lower for w in ["excited", "forward", "love"]):
            return "Enthusiastic"
        if any(w in lower for w in ["thank", "appreciate"]):
            return "Delighted"
        return "Interested"
    if sentiment == "Negative":
        if any(w in lower for w in ["angry", "terrible", "unacceptable"]):
            return "Frustrated"
        if any(w in lower for w in ["concern", "worry"]):
            return "Concerned"
        return "Disappointed"
    # Neutral
    if any(w in lower for w in ["maybe", "think", "considering"]):
        return "Contemplative"
    return "Curious"


def _build_suggestion(text: str, sentiment: str) -> str:
    """
    Generates a context-aware suggestion by cross-referencing sentiment
    with keywords found in the email.
    """
    lower = text.lower()
    base = _SUGGESTIONS.get(sentiment, _SUGGESTIONS["Neutral"])

    # Contextual overrides
    if sentiment == "Positive" and any(w in lower for w in ["price", "cost", "budget"]):
        return "Client is interested but has pricing questions. Send a detailed pricing breakdown and ROI analysis."
    if sentiment == "Negative" and any(w in lower for w in ["delay", "timeline", "deadline"]):
        return "Client is frustrated with timeline. Provide an updated delivery plan with firm commitments."
    if sentiment == "Neutral" and any(w in lower for w in ["competitor", "alternative", "comparison"]):
        return "Client is comparing options. Share a competitive battlecard and set up a live demo."

    return base
