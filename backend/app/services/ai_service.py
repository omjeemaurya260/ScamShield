import os
import re
import json
import base64
from typing import Optional
import httpx
from .detection_engine import analyze_message as rule_analyze

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

SYSTEM_PROMPT = """You are ScamShield AI, an expert cybersecurity analyst specializing in Indian digital fraud detection.
Analyze the provided message and return a JSON response with this exact structure:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "SAFE",
  "risk_score": <integer 0-100>,
  "category": "<scam category or 'General Communication'>",
  "confidence": <float 0.0-1.0>,
  "red_flags": [{"indicator": "<name>", "explanation": "<explanation>"}],
  "keywords": ["<keyword1>", "<keyword2>"],
  "explanation": "<plain language explanation>",
  "recommendations": ["<action1>", "<action2>"]
}

Known Indian scam categories:
- KYC Phishing
- UPI Payment Scam  
- OTP Theft
- Bank Fraud
- Lottery/Prize Scam
- Job Scam
- Parcel Delivery Scam
- Digital Arrest Scam
- Phishing Link
- Investment Fraud
- General Communication

Risk score guide: 0-29 = Low Risk (SAFE), 30-69 = Medium Risk (SUSPICIOUS), 70-100 = High Risk (SCAM)
Respond ONLY with valid JSON. No markdown, no explanation outside the JSON."""


async def analyze_with_gemini(message: str, language: str = "en") -> Optional[dict]:
    """Call Gemini API for AI-powered scam analysis."""
    if not GEMINI_API_KEY:
        return None

    lang_instruction = "Provide the explanation and recommendations in Hindi (Devanagari script)." if language == "hi" else "Provide explanation and recommendations in English."

    prompt = f"""{lang_instruction}

Analyze this message for scam indicators:

MESSAGE:
{message}

Return only valid JSON as specified."""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [
                        {"parts": [{"text": SYSTEM_PROMPT}], "role": "user"},
                        {"parts": [{"text": prompt}], "role": "user"}
                    ],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 1024
                    }
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Strip markdown if present
                text = re.sub(r"```json\n?", "", text)
                text = re.sub(r"```\n?", "", text)
                result = json.loads(text.strip())
                result["analysis_method"] = "gemini_ai"
                return result
    except Exception as e:
        print(f"Gemini API error: {e}")
    return None


async def analyze_with_openai(message: str, language: str = "en") -> Optional[dict]:
    """Call OpenAI API as fallback."""
    if not OPENAI_API_KEY:
        return None

    lang_instruction = "Provide explanation in Hindi." if language == "hi" else "Provide explanation in English."

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"{lang_instruction}\n\nAnalyze:\n{message}"}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 1024,
                    "response_format": {"type": "json_object"}
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                result = json.loads(data["choices"][0]["message"]["content"])
                result["analysis_method"] = "openai_ai"
                return result
    except Exception as e:
        print(f"OpenAI API error: {e}")
    return None


async def analyze_message_ai(message: str, language: str = "en") -> dict:
    """
    Primary AI analysis function with fallback chain:
    1. Gemini AI
    2. OpenAI
    3. Rule-based engine
    """
    # Try Gemini first
    result = await analyze_with_gemini(message, language)
    if result:
        return result

    # Try OpenAI
    result = await analyze_with_openai(message, language)
    if result:
        return result

    # Fallback to rule-based
    result = rule_analyze(message, language)
    return result
