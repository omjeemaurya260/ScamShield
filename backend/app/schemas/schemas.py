from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum


class Language(str, Enum):
    en = "en"
    hi = "hi"


class Verdict(str, Enum):
    SCAM = "SCAM"
    SUSPICIOUS = "SUSPICIOUS"
    SAFE = "SAFE"


class RedFlag(BaseModel):
    indicator: str
    explanation: str


class MessageAnalysisRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="The message text to analyze")
    language: Language = Field(default=Language.en, description="Language for response: 'en' or 'hi'")

    @validator("message")
    def sanitize_message(cls, v):
        return v.strip()


class AnalysisResponse(BaseModel):
    verdict: str
    risk_score: int = Field(..., ge=0, le=100)
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    red_flags: List[RedFlag] = []
    keywords: List[str] = []
    explanation: str
    recommendations: List[str] = []
    analysis_method: str = "rule_based"
    scan_id: Optional[str] = None


class URLAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2000)


class URLSuspiciousPattern(BaseModel):
    pattern: str
    explanation: str


class URLAnalysisResponse(BaseModel):
    url: str
    is_valid: bool
    is_https: bool
    domain: str
    tld: str
    risk_score: int
    verdict: str
    suspicious_patterns: List[URLSuspiciousPattern] = []
    recommendations: List[str] = []
    scan_id: Optional[str] = None


class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=200)
    relationship: Optional[str] = Field(default=None, max_length=50)
    alert_on_scam: bool = True
    alert_on_suspicious: bool = False


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    relationship: Optional[str] = None
    alert_on_scam: Optional[bool] = None
    alert_on_suspicious: Optional[bool] = None
    active: Optional[bool] = None


class ContactResponse(ContactBase):
    id: str
    created_at: str
    active: bool = True


class AlertRequest(BaseModel):
    contact_id: str
    scan_id: str
    verdict: str
    risk_score: int
    category: str
    message_preview: Optional[str] = None  # consent-based, truncated
    user_consent: bool = Field(..., description="User must explicitly consent to share data")


class AlertResponse(BaseModel):
    id: str
    contact_id: str
    scan_id: str
    status: str  # "simulated" | "sent" | "failed"
    message: str
    created_at: str


class DashboardStats(BaseModel):
    total_scans: int
    scams_detected: int
    suspicious_messages: int
    safe_messages: int
    recent_scans: List[dict] = []


class ScanHistoryItem(BaseModel):
    id: str
    input_type: str  # message | image | audio | url
    verdict: str
    risk_score: int
    category: str
    created_at: str
    preview: Optional[str] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int
