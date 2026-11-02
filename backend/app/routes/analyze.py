import os
import re
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse

from ..schemas.schemas import (
    MessageAnalysisRequest, AnalysisResponse,
    URLAnalysisRequest, URLAnalysisResponse
)
from ..services.ai_service import analyze_message_ai
from ..services.detection_engine import analyze_url_safety
from ..services.media_service import extract_text_from_image, transcribe_audio
from ..database.db import save_scan

router = APIRouter(prefix="/api/analyze", tags=["Analysis"])

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a", "audio/mp4", "audio/webm", "audio/ogg"}


@router.post("/message", summary="Analyze text message for scams")
async def analyze_message(request: MessageAnalysisRequest):
    """
    Analyze a text message (SMS, WhatsApp, email) for scam indicators.
    Uses AI with rule-based fallback.
    """
    result = await analyze_message_ai(request.message, request.language)

    # Save to history
    scan_record = {
        "input_type": "message",
        "input_preview": request.message[:200] + "..." if len(request.message) > 200 else request.message,
        "verdict": result["verdict"],
        "risk_score": result["risk_score"],
        "category": result.get("category", "Unknown"),
        "confidence": result.get("confidence", 0.0),
        "language": request.language,
        "full_result": result
    }
    saved = await save_scan(scan_record)
    result["scan_id"] = saved.get("id", "")

    return JSONResponse(content=result)


@router.post("/image", summary="Analyze screenshot for scam content")
async def analyze_image(
    file: UploadFile = File(...),
    language: str = Form(default="en")
):
    """
    Upload a screenshot image, extract text via OCR, then analyze for scams.
    """
    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: PNG, JPG, JPEG, WEBP"
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {os.getenv('MAX_FILE_SIZE_MB', '10')}MB"
        )

    # Extract text via OCR
    ocr_result = extract_text_from_image(image_bytes, file.filename or "image")

    if not ocr_result["success"]:
        return JSONResponse(content={
            "ocr_success": False,
            "ocr_error": ocr_result["error"],
            "verdict": "UNKNOWN",
            "risk_score": 0,
            "category": "OCR Failed",
            "explanation": ocr_result["error"],
            "recommendations": ["Please ensure the image contains clear, readable text."],
            "red_flags": [],
            "keywords": []
        })

    extracted_text = ocr_result["text"]

    # Analyze extracted text
    analysis = await analyze_message_ai(extracted_text, language)
    analysis["ocr_success"] = True
    analysis["extracted_text"] = extracted_text
    analysis["ocr_method"] = ocr_result.get("method", "tesseract")
    analysis["word_count"] = ocr_result.get("word_count", 0)

    # Save scan
    scan_record = {
        "input_type": "image",
        "input_preview": extracted_text[:200],
        "filename": file.filename,
        "verdict": analysis["verdict"],
        "risk_score": analysis["risk_score"],
        "category": analysis.get("category", "Unknown"),
        "language": language,
        "full_result": analysis
    }
    saved = await save_scan(scan_record)
    analysis["scan_id"] = saved.get("id", "")

    return JSONResponse(content=analysis)


@router.post("/audio", summary="Analyze audio recording for scam content")
async def analyze_audio(
    file: UploadFile = File(...),
    language: str = Form(default="en")
):
    """
    Upload audio recording, transcribe speech, then analyze for scam indicators.
    """
    audio_bytes = await file.read()

    if len(audio_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large."
        )

    # Transcribe
    transcription = transcribe_audio(audio_bytes, file.filename or "audio.wav", language)

    if not transcription["success"]:
        return JSONResponse(content={
            "transcription_success": False,
            "transcription_error": transcription["error"],
            "verdict": "UNKNOWN",
            "risk_score": 0,
            "explanation": transcription["error"],
            "recommendations": ["Please upload a clear audio recording with speech."],
            "red_flags": [],
            "keywords": []
        })

    transcript_text = transcription["text"]

    # Analyze transcript
    analysis = await analyze_message_ai(transcript_text, language)
    analysis["transcription_success"] = True
    analysis["transcript"] = transcript_text
    analysis["transcription_method"] = transcription.get("method", "speech_recognition")

    # Save scan
    scan_record = {
        "input_type": "audio",
        "input_preview": transcript_text[:200],
        "filename": file.filename,
        "verdict": analysis["verdict"],
        "risk_score": analysis["risk_score"],
        "category": analysis.get("category", "Unknown"),
        "language": language,
        "full_result": analysis
    }
    saved = await save_scan(scan_record)
    analysis["scan_id"] = saved.get("id", "")

    return JSONResponse(content=analysis)


@router.post("/url", summary="Check URL for phishing/malicious content")
async def analyze_url(request: URLAnalysisRequest):
    """
    Analyze a URL for phishing indicators, suspicious patterns, and safety.
    Uses heuristic analysis (not live threat intel).
    """
    result = analyze_url_safety(request.url)

    # Save scan
    scan_record = {
        "input_type": "url",
        "input_preview": request.url[:200],
        "verdict": result.get("verdict", "UNKNOWN"),
        "risk_score": result.get("risk_score", 0),
        "category": "URL Analysis",
        "full_result": result
    }
    saved = await save_scan(scan_record)
    result["scan_id"] = saved.get("id", "")

    return JSONResponse(content=result)
