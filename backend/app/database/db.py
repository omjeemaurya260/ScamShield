import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "scamshield_data.json"

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "scamshield")

_mongo_client = None
_mongo_available = False
_db = None
_lock = asyncio.Lock()

# ─── Initial Seed Data (Realistic Demonstrative Scans) ─────────────────────────

def generate_seed_data() -> Dict[str, Any]:
    now = datetime.utcnow()
    
    def dt(days_ago: int, hours_ago: int = 0) -> str:
        return (now - timedelta(days=days_ago, hours=hours_ago)).isoformat()

    seed_scans = [
        {
            "id": "scan_1001",
            "created_at": dt(0, 1),
            "input_type": "message",
            "input_preview": "Dear SBI customer, your YONO account is suspended. Update your PAN card immediately: https://sbi-kyc-update.xyz/verify",
            "verdict": "SCAM",
            "risk_score": 96,
            "category": "KYC Phishing",
            "confidence": 0.98,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 96,
                "category": "KYC Phishing",
                "confidence": 0.98,
                "explanation": "This message uses fake bank impersonation with urgent account suspension threats and a phishing link.",
                "keywords": ["sbi", "suspended", "update pan", "verify"],
                "red_flags": [
                    {"indicator": "Urgency", "explanation": "Threatens immediate suspension"},
                    {"indicator": "Suspicious Link", "explanation": "Uses unofficial domain .xyz"}
                ],
                "recommendations": ["Do not click the link", "Report to 1930", "Block sender"]
            }
        },
        {
            "id": "scan_1002",
            "created_at": dt(0, 4),
            "input_type": "message",
            "input_preview": "Sir I sent Rs.5000 by mistake to your Google Pay. Please send it back immediately to this UPI ID: refund-pay@okhdfcbank",
            "verdict": "SCAM",
            "risk_score": 88,
            "category": "UPI Payment Scam",
            "confidence": 0.95,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 88,
                "category": "UPI Payment Scam",
                "confidence": 0.95,
                "explanation": "Classic accidental transfer scam designed to trick victims into initiating unauthorized UPI payments.",
                "keywords": ["google pay", "by mistake", "send it back", "upi id"],
                "red_flags": [
                    {"indicator": "UPI Payment Request", "explanation": "Demands quick transfer without bank verification"},
                    {"indicator": "False Claim", "explanation": "Fake accidental payment claim"}
                ],
                "recommendations": ["Check bank statement directly", "Never approve unknown UPI collect requests"]
            }
        },
        {
            "id": "scan_1003",
            "created_at": dt(1, 2),
            "input_type": "image",
            "input_preview": "Screenshot of WhatsApp message claiming Part-Time Work from home earning Rs.3000 to Rs.8000 daily by liking YouTube videos.",
            "verdict": "SCAM",
            "risk_score": 92,
            "category": "Job Scam",
            "confidence": 0.94,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 92,
                "category": "Job Scam",
                "confidence": 0.94,
                "explanation": "Work from home task scam asking for initial deposit after giving small token earnings.",
                "keywords": ["part time", "work from home", "earn daily", "telegram"],
                "red_flags": [
                    {"indicator": "Unrealistic Earnings", "explanation": "Promises thousands daily for simple clicks"},
                    {"indicator": "Telegram Redirection", "explanation": "Pushes conversations to unmonitored channels"}
                ],
                "recommendations": ["Do not deposit any money", "Block the WhatsApp contact"]
            }
        },
        {
            "id": "scan_1004",
            "created_at": dt(1, 6),
            "input_type": "url",
            "input_preview": "http://192.168.1.45/secure-hdfc-netbanking-login/auth.php",
            "verdict": "DANGEROUS",
            "risk_score": 95,
            "category": "Phishing Link",
            "confidence": 0.99,
            "language": "en",
            "full_result": {
                "verdict": "DANGEROUS",
                "risk_score": 95,
                "category": "Phishing Link",
                "explanation": "Malicious phishing portal masquerading as HDFC net banking using raw IP and unencrypted HTTP.",
                "suspicious_patterns": [
                    {"pattern": "IP Address URL", "explanation": "Uses bare IP address instead of registered domain"},
                    {"pattern": "No HTTPS", "explanation": "Insecure plaintext transmission"}
                ],
                "recommendations": ["Do not open this link", "Report to national cybercrime portal"]
            }
        },
        {
            "id": "scan_1005",
            "created_at": dt(2, 3),
            "input_type": "audio",
            "input_preview": "This is Inspector Rajesh from Mumbai Police Cyber Cell. A parcel sent in your name to Taiwan contains 5 passports and narcotics. You are under Digital Arrest.",
            "verdict": "SCAM",
            "risk_score": 98,
            "category": "Digital Arrest Scam",
            "confidence": 0.99,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 98,
                "category": "Digital Arrest Scam",
                "confidence": 0.99,
                "explanation": "Digital Arrest fraud. Police or CBI never conduct arrests, warrants, or court proceedings via phone or video calls.",
                "keywords": ["inspector", "cyber cell", "narcotics", "digital arrest", "passports"],
                "red_flags": [
                    {"indicator": "Impersonation", "explanation": "Falsely claims to be police official"},
                    {"indicator": "Digital Arrest Threat", "explanation": "Fictitious legal concept used to extort money"}
                ],
                "recommendations": ["Disconnect call immediately", "Dial 1930 Cybercrime Helpline", "Inform family"]
            }
        },
        {
            "id": "scan_1006",
            "created_at": dt(2, 8),
            "input_type": "message",
            "input_preview": "Your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Contact Electricity Officer: 9876543210",
            "verdict": "SCAM",
            "risk_score": 91,
            "category": "Electricity Bill Scam",
            "confidence": 0.96,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 91,
                "category": "Electricity Bill Scam",
                "confidence": 0.96,
                "explanation": "Widespread utility scam tricking users into downloading malicious remote desktop APKs.",
                "keywords": ["electricity", "power disconnect", "officer"],
                "red_flags": [
                    {"indicator": "Urgent Threat", "explanation": "Claims imminent power cutoff"},
                    {"indicator": "Personal Phone Number", "explanation": "Official discoms do not send personal numbers"}
                ],
                "recommendations": ["Never call numbers in such SMS", "Check official discom app"]
            }
        },
        {
            "id": "scan_1007",
            "created_at": dt(3, 1),
            "input_type": "message",
            "input_preview": "FedEx: Your package delivery has been held at customs due to unpaid duty of Rs.1450. Pay now to avoid clearance failure: https://fedex-express-track.top",
            "verdict": "SCAM",
            "risk_score": 85,
            "category": "Parcel Scams",
            "confidence": 0.92,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 85,
                "category": "Parcel Scams",
                "confidence": 0.92,
                "explanation": "Fake courier notification with phishing page for credit card details.",
                "keywords": ["fedex", "customs", "unpaid duty", "clearance"],
                "red_flags": [
                    {"indicator": "Suspicious TLD", "explanation": ".top domain used by fraudsters"}
                ],
                "recommendations": ["Check official courier tracking website directly"]
            }
        },
        {
            "id": "scan_1008",
            "created_at": dt(3, 7),
            "input_type": "message",
            "input_preview": "Hi Mom, I dropped my phone in water and this is my new temporary number. Please WhatsApp me on this number ASAP.",
            "verdict": "SUSPICIOUS",
            "risk_score": 62,
            "category": "Family Impersonation",
            "confidence": 0.82,
            "language": "en",
            "full_result": {
                "verdict": "SUSPICIOUS",
                "risk_score": 62,
                "category": "Family Impersonation",
                "confidence": 0.82,
                "explanation": "Impersonates a family member in distress to subsequently solicit urgent money transfers.",
                "keywords": ["new temporary number", "dropped phone"],
                "red_flags": [
                    {"indicator": "Unverified Sender", "explanation": "Claims to be a relative on a new number"}
                ],
                "recommendations": ["Call original number directly to confirm before replying"]
            }
        },
        {
            "id": "scan_1009",
            "created_at": dt(4, 3),
            "input_type": "message",
            "input_preview": "Congratulations! You have been selected for Jio Lucky Draw 2026. Claim your prize money of Rs. 25,00,000 now. Call lottery manager.",
            "verdict": "SCAM",
            "risk_score": 94,
            "category": "Lottery/Prize Scam",
            "confidence": 0.97,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 94,
                "category": "Lottery/Prize Scam",
                "confidence": 0.97,
                "explanation": "Advance fee fraud claiming unentered lottery win.",
                "keywords": ["lucky draw", "claim prize", "lottery"],
                "red_flags": [
                    {"indicator": "Unsolicited Prize", "explanation": "Claiming prize without entering any contest"}
                ],
                "recommendations": ["Delete and report message immediately"]
            }
        },
        {
            "id": "scan_1010",
            "created_at": dt(4, 9),
            "input_type": "message",
            "input_preview": "Your OTP for login to IRCTC Rail Connect is 482910. Valid for 5 mins. Do not share this OTP with anyone.",
            "verdict": "SAFE",
            "risk_score": 5,
            "category": "Legitimate OTP",
            "confidence": 0.99,
            "language": "en",
            "full_result": {
                "verdict": "SAFE",
                "risk_score": 5,
                "category": "Legitimate OTP",
                "confidence": 0.99,
                "explanation": "Standard legitimate transactional authentication OTP with explicit warning not to share.",
                "keywords": ["irctc", "otp", "do not share"],
                "red_flags": [],
                "recommendations": ["Never share this OTP with anyone"]
            }
        },
        {
            "id": "scan_1011",
            "created_at": dt(5, 4),
            "input_type": "message",
            "input_preview": "Your salary of Rs. 65,000 has been credited to your HDFC Bank A/c ending 4892. Available balance Rs. 84,210. Official bank ref: TXN83921932.",
            "verdict": "SAFE",
            "risk_score": 2,
            "category": "Bank Notification",
            "confidence": 0.99,
            "language": "en",
            "full_result": {
                "verdict": "SAFE",
                "risk_score": 2,
                "category": "Bank Notification",
                "confidence": 0.99,
                "explanation": "Legitimate bank transactional credit alert. No urgent demands, credential requests, or suspicious links.",
                "keywords": ["credited", "hdfc bank", "balance"],
                "red_flags": [],
                "recommendations": ["Verify balance in official mobile app"]
            }
        },
        {
            "id": "scan_1012",
            "created_at": dt(6, 2),
            "input_type": "message",
            "input_preview": "Special Diwali discount: Get 40% off on all clothing at Myntra this weekend. Use code FESTIVE40. Visit https://myntra.com",
            "verdict": "SAFE",
            "risk_score": 8,
            "category": "Promotional Message",
            "confidence": 0.95,
            "language": "en",
            "full_result": {
                "verdict": "SAFE",
                "risk_score": 8,
                "category": "Promotional Message",
                "confidence": 0.95,
                "explanation": "Authentic promotional marketing message from verified e-commerce merchant.",
                "keywords": ["discount", "festive", "myntra.com"],
                "red_flags": [],
                "recommendations": ["Ensure you browse on verified app or site"]
            }
        },
        {
            "id": "scan_1013",
            "created_at": dt(6, 7),
            "input_type": "message",
            "input_preview": "Exclusive Investment Opportunity: Invest 10,000 in Crypto VIP Trading Group and get guaranteed 50,000 return in 24 hours. WhatsApp our financial advisor.",
            "verdict": "SCAM",
            "risk_score": 93,
            "category": "Investment Fraud",
            "confidence": 0.96,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 93,
                "category": "Investment Fraud",
                "confidence": 0.96,
                "explanation": "High-yield investment Ponzi scam promising impossible guaranteed returns.",
                "keywords": ["crypto", "guaranteed return", "invest", "financial advisor"],
                "red_flags": [
                    {"indicator": "Unrealistic Return", "explanation": "Promises 500% profit in 24 hours"},
                    {"indicator": "Unregistered Advisor", "explanation": "Unlicensed financial solicitation"}
                ],
                "recommendations": ["Never send money for guaranteed crypto schemes"]
            }
        },
        {
            "id": "scan_1014",
            "created_at": dt(8, 5),
            "input_type": "message",
            "input_preview": "Bank of India alert: Dear user your net banking service is blocked due to unverified PAN. Click here to verify your credentials: http://boi-online-support.cf",
            "verdict": "SCAM",
            "risk_score": 95,
            "category": "KYC Phishing",
            "confidence": 0.97,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 95,
                "category": "KYC Phishing",
                "confidence": 0.97,
                "explanation": "Phishing lure targeting Bank of India credentials using free suspicious domain.",
                "keywords": ["bank of india", "pan", "verify credentials"],
                "red_flags": [
                    {"indicator": "Free Domain TLD", "explanation": ".cf domain often abused by phishers"}
                ],
                "recommendations": ["Never enter banking passwords on external links"]
            }
        },
        {
            "id": "scan_1015",
            "created_at": dt(12, 4),
            "input_type": "message",
            "input_preview": "URGENT: Please share OTP received for transaction verification on your credit card. Customer service agent waiting on line.",
            "verdict": "SCAM",
            "risk_score": 99,
            "category": "OTP Theft",
            "confidence": 0.99,
            "language": "en",
            "full_result": {
                "verdict": "SCAM",
                "risk_score": 99,
                "category": "OTP Theft",
                "confidence": 0.99,
                "explanation": "Direct attempt to harvest One-Time Password to authorize an illegal debit card or net banking transaction.",
                "keywords": ["urgent", "share otp", "transaction verification"],
                "red_flags": [
                    {"indicator": "Direct OTP Solicitation", "explanation": "Zero tolerance indicator - banks never ask for OTP"}
                ],
                "recommendations": ["Do not share OTP under any circumstances", "Block card immediately"]
            }
        }
    ]

    seed_contacts = [
        {
            "id": "contact_1",
            "name": "Father (Ramesh Kumar)",
            "phone": "+91 98765 43210",
            "email": "ramesh.kumar@example.com",
            "relationship": "Parent",
            "alert_on_scam": True,
            "alert_on_suspicious": True,
            "active": True,
            "created_at": dt(15, 0)
        },
        {
            "id": "contact_2",
            "name": "Mother (Sunita Kumar)",
            "phone": "+91 98765 43211",
            "email": "sunita.kumar@example.com",
            "relationship": "Parent",
            "alert_on_scam": True,
            "alert_on_suspicious": False,
            "active": True,
            "created_at": dt(15, 0)
        }
    ]

    seed_alerts = [
        {
            "id": "alert_101",
            "contact_id": "contact_1",
            "scan_id": "scan_1001",
            "verdict": "SCAM",
            "risk_score": 96,
            "category": "KYC Phishing",
            "status": "simulated",
            "note": "⚠️ PROTOTYPE MODE: This alert has been logged for demonstration purposes.",
            "created_at": dt(0, 1)
        }
    ]

    return {
        "scan_history": seed_scans,
        "contacts": seed_contacts,
        "alerts": seed_alerts,
        "id_counter": 2000
    }

# ─── File-Based Store Management ──────────────────────────────────────────────

_store_cache: Optional[Dict[str, Any]] = None

def _load_store() -> Dict[str, Any]:
    global _store_cache
    if _store_cache is not None:
        return _store_cache

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                _store_cache = json.load(f)
                return _store_cache
        except Exception as e:
            print(f"[ScamShield DB] Warning: error reading data file ({e}), generating seed data.")

    _store_cache = generate_seed_data()
    _save_store_sync(_store_cache)
    return _store_cache

def _save_store_sync(data: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_file = DATA_FILE.with_suffix(".tmp")
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    tmp_file.replace(DATA_FILE)

def get_store() -> Dict[str, Any]:
    return _load_store()

def generate_id() -> str:
    store = get_store()
    store["id_counter"] = store.get("id_counter", 2000) + 1
    new_id = f"scan_{store['id_counter']}"
    _save_store_sync(store)
    return new_id

# ─── MongoDB Probing & Initialization ─────────────────────────────────────────

async def init_db() -> bool:
    """Non-blocking check to test if MongoDB is available."""
    global _mongo_client, _mongo_available, _db
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=500)
        await client.server_info()
        _mongo_client = client
        _db = client[DATABASE_NAME]
        _mongo_available = True
        print("[ScamShield DB] Connected to MongoDB.")
        return True
    except Exception:
        _mongo_available = False
        print("[ScamShield DB] Using file-backed storage (data/scamshield_data.json).")
        return False

# ─── Core CRUD Operations ─────────────────────────────────────────────────────

async def save_scan(scan_data: dict) -> dict:
    if "created_at" not in scan_data:
        scan_data["created_at"] = datetime.utcnow().isoformat()
    
    async with _lock:
        store = get_store()
        scan_id = generate_id()
        scan_data["id"] = scan_id
        scan_data["_id"] = scan_id
        store["scan_history"].append(scan_data)
        _save_store_sync(store)
        return scan_data

async def get_scan_history(limit: int = 50, skip: int = 0, search: str = "") -> List[dict]:
    store = get_store()
    items = store["scan_history"]
    if search:
        s = search.lower()
        items = [
            i for i in items
            if s in i.get("category", "").lower()
            or s in i.get("verdict", "").lower()
            or s in i.get("input_type", "").lower()
            or s in str(i.get("input_preview", "")).lower()
        ]
    sorted_items = sorted(items, key=lambda x: x.get("created_at", ""), reverse=True)
    return sorted_items[skip : skip + limit]

async def get_scan_by_id(scan_id: str) -> Optional[dict]:
    store = get_store()
    for item in store["scan_history"]:
        if item.get("id") == scan_id or item.get("_id") == scan_id:
            return item
    return None

async def delete_scan(scan_id: str) -> bool:
    async with _lock:
        store = get_store()
        orig_len = len(store["scan_history"])
        store["scan_history"] = [
            i for i in store["scan_history"]
            if i.get("id") != scan_id and i.get("_id") != scan_id
        ]
        if len(store["scan_history"]) < orig_len:
            _save_store_sync(store)
            return True
        return False

# ─── Contacts & Alerts ────────────────────────────────────────────────────────

async def get_contacts() -> List[dict]:
    store = get_store()
    return store.get("contacts", [])

async def create_contact(contact: dict) -> dict:
    async with _lock:
        store = get_store()
        contact["id"] = f"contact_{len(store['contacts']) + 1}"
        contact["created_at"] = datetime.utcnow().isoformat()
        contact["active"] = True
        store["contacts"].append(contact)
        _save_store_sync(store)
        return contact

async def update_contact(contact_id: str, data: dict) -> Optional[dict]:
    async with _lock:
        store = get_store()
        for c in store["contacts"]:
            if c.get("id") == contact_id:
                c.update(data)
                _save_store_sync(store)
                return c
        return None

async def delete_contact(contact_id: str) -> bool:
    async with _lock:
        store = get_store()
        orig_len = len(store["contacts"])
        store["contacts"] = [c for c in store["contacts"] if c.get("id") != contact_id]
        if len(store["contacts"]) < orig_len:
            _save_store_sync(store)
            return True
        return False

async def save_alert(alert: dict) -> dict:
    async with _lock:
        store = get_store()
        alert["id"] = f"alert_{len(store['alerts']) + 1}"
        alert["created_at"] = datetime.utcnow().isoformat()
        store["alerts"].append(alert)
        _save_store_sync(store)
        return alert

async def get_alerts(limit: int = 20) -> List[dict]:
    store = get_store()
    alerts = store.get("alerts", [])
    return sorted(alerts, key=lambda x: x.get("created_at", ""), reverse=True)[:limit]

# ─── Filter Helper ────────────────────────────────────────────────────────────

def parse_iso(dt_str: str) -> datetime:
    try:
        # Handle trailing Z or timezone offsets
        clean = dt_str.replace("Z", "").split("+")[0]
        return datetime.fromisoformat(clean)
    except Exception:
        return datetime.utcnow()

def filter_by_days(items: List[dict], days: Optional[int]) -> List[dict]:
    if not days or days <= 0:
        return items
    cutoff = datetime.utcnow() - timedelta(days=days)
    return [i for i in items if parse_iso(i.get("created_at", "")) >= cutoff]

# ─── Aggregations for Analytics & Dashboard ───────────────────────────────────

async def get_dashboard_stats(days: Optional[int] = None) -> dict:
    """
    Returns actual counts, percentage changes vs previous period, and recent scans.
    """
    store = get_store()
    all_items = store["scan_history"]
    
    current_items = filter_by_days(all_items, days)
    now = datetime.utcnow()

    # Calculate trends vs previous period if days filter is given
    total_change = 0.0
    scam_change = 0.0
    suspicious_change = 0.0
    safe_change = 0.0

    if days and days > 0:
        current_cutoff = now - timedelta(days=days)
        previous_cutoff = now - timedelta(days=days * 2)
        prev_items = [
            i for i in all_items
            if previous_cutoff <= parse_iso(i.get("created_at", "")) < current_cutoff
        ]

        def calc_pct(cur: int, prev: int) -> float:
            if prev == 0:
                return 100.0 if cur > 0 else 0.0
            return round(((cur - prev) / prev) * 100, 1)

        cur_total = len(current_items)
        prev_total = len(prev_items)
        total_change = calc_pct(cur_total, prev_total)

        cur_scams = sum(1 for i in current_items if i.get("verdict") in ("SCAM", "DANGEROUS"))
        prev_scams = sum(1 for i in prev_items if i.get("verdict") in ("SCAM", "DANGEROUS"))
        scam_change = calc_pct(cur_scams, prev_scams)

        cur_sus = sum(1 for i in current_items if i.get("verdict") == "SUSPICIOUS")
        prev_sus = sum(1 for i in prev_items if i.get("verdict") == "SUSPICIOUS")
        suspicious_change = calc_pct(cur_sus, prev_sus)

        cur_safe = sum(1 for i in current_items if i.get("verdict") == "SAFE")
        prev_safe = sum(1 for i in prev_items if i.get("verdict") == "SAFE")
        safe_change = calc_pct(cur_safe, prev_safe)
    else:
        # If all-time is selected, compare last 30 days vs prior 30 days for trend indication
        pass

    scams = sum(1 for i in current_items if i.get("verdict") in ("SCAM", "DANGEROUS"))
    suspicious = sum(1 for i in current_items if i.get("verdict") == "SUSPICIOUS")
    safe = sum(1 for i in current_items if i.get("verdict") == "SAFE")
    recent = sorted(current_items, key=lambda x: x.get("created_at", ""), reverse=True)[:5]

    return {
        "total_scans": len(current_items),
        "scams_detected": scams,
        "suspicious_messages": suspicious,
        "safe_messages": safe,
        "total_change": total_change,
        "scam_change": scam_change,
        "suspicious_change": suspicious_change,
        "safe_change": safe_change,
        "recent_scans": recent
    }

async def get_scam_distribution(days: Optional[int] = None) -> dict:
    store = get_store()
    items = filter_by_days(store["scan_history"], days)
    total = len(items)

    scam_count = sum(1 for i in items if i.get("verdict") in ("SCAM", "DANGEROUS"))
    suspicious_count = sum(1 for i in items if i.get("verdict") == "SUSPICIOUS")
    safe_count = sum(1 for i in items if i.get("verdict") == "SAFE")

    scam_pct = round((scam_count / total * 100), 1) if total > 0 else 0.0
    sus_pct = round((suspicious_count / total * 100), 1) if total > 0 else 0.0
    safe_pct = round((safe_count / total * 100), 1) if total > 0 else 0.0

    return {
        "total_scans": total,
        "scam": scam_count,
        "suspicious": suspicious_count,
        "safe": safe_count,
        "percentages": {
            "scam": scam_pct,
            "suspicious": sus_pct,
            "safe": safe_pct
        },
        "data": [
            {"name": "Scam", "value": scam_count, "percentage": scam_pct, "color": "#ef4444"},
            {"name": "Suspicious", "value": suspicious_count, "percentage": sus_pct, "color": "#f97316"},
            {"name": "Safe", "value": safe_count, "percentage": safe_pct, "color": "#22c55e"}
        ]
    }

async def get_scam_categories(days: Optional[int] = None) -> dict:
    store = get_store()
    items = filter_by_days(store["scan_history"], days)
    
    # Count frequency of each actual category
    cat_counts: Dict[str, int] = {}
    cat_risk_sum: Dict[str, int] = {}
    
    for i in items:
        cat = i.get("category", "Uncategorized")
        if not cat or cat in ("General Communication", "No Content"):
            continue
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        cat_risk_sum[cat] = cat_risk_sum.get(cat, 0) + i.get("risk_score", 50)

    total_flagged = sum(cat_counts.values())

    categories_list = []
    for cat, count in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True):
        avg_risk = cat_risk_sum[cat] / count if count > 0 else 0
        categories_list.append({
            "category": cat,
            "count": count,
            "percentage": round((count / total_flagged * 100), 1) if total_flagged > 0 else 0,
            "risk_level": "High" if avg_risk >= 70 else "Medium"
        })

    return {
        "total_flagged": total_flagged,
        "categories": categories_list
    }

async def get_daily_trends(days: Optional[int] = 7) -> dict:
    store = get_store()
    items = store["scan_history"]
    now = datetime.utcnow().date()
    
    num_days = days if (days and days > 0) else 30
    date_keys = [(now - timedelta(days=d)) for d in range(num_days - 1, -1, -1)]
    
    daily_map = {
        d.isoformat(): {
            "date": d.isoformat(),
            "formatted_date": d.strftime("%d %b"),
            "total": 0,
            "scam": 0,
            "suspicious": 0,
            "safe": 0
        }
        for d in date_keys
    }

    for i in items:
        dt = parse_iso(i.get("created_at", "")).date()
        key = dt.isoformat()
        if key in daily_map:
            daily_map[key]["total"] += 1
            v = i.get("verdict", "")
            if v in ("SCAM", "DANGEROUS"):
                daily_map[key]["scam"] += 1
            elif v == "SUSPICIOUS":
                daily_map[key]["suspicious"] += 1
            elif v == "SAFE":
                daily_map[key]["safe"] += 1

    return {"trends": list(daily_map.values())}

async def get_risk_distribution(days: Optional[int] = 7) -> dict:
    store = get_store()
    items = store["scan_history"]
    now = datetime.utcnow().date()
    
    num_days = days if (days and days > 0) else 30
    date_keys = [(now - timedelta(days=d)) for d in range(num_days - 1, -1, -1)]

    dist_map = {
        d.isoformat(): {
            "date": d.isoformat(),
            "formatted_date": d.strftime("%d %b"),
            "low": 0,
            "medium": 0,
            "high": 0,
            "total": 0
        }
        for d in date_keys
    }

    for i in items:
        dt = parse_iso(i.get("created_at", "")).date()
        key = dt.isoformat()
        if key in dist_map:
            score = i.get("risk_score", 0)
            dist_map[key]["total"] += 1
            if score >= 70:
                dist_map[key]["high"] += 1
            elif score >= 30:
                dist_map[key]["medium"] += 1
            else:
                dist_map[key]["low"] += 1

    return {"distribution": list(dist_map.values())}

async def get_input_types(days: Optional[int] = None) -> dict:
    store = get_store()
    items = filter_by_days(store["scan_history"], days)
    total = len(items)

    type_counts: Dict[str, Dict[str, Any]] = {
        "message": {"label": "Text Messages", "color": "#06b6d4", "count": 0, "scams": 0},
        "image": {"label": "Screenshots", "color": "#a855f7", "count": 0, "scams": 0},
        "url": {"label": "Phishing URLs", "color": "#3b82f6", "count": 0, "scams": 0},
        "audio": {"label": "Call Recordings", "color": "#ec4899", "count": 0, "scams": 0},
    }

    for i in items:
        t = i.get("input_type", "message")
        if t not in type_counts:
            t = "message"
        type_counts[t]["count"] += 1
        if i.get("verdict") in ("SCAM", "DANGEROUS"):
            type_counts[t]["scams"] += 1

    types_list = []
    for k, v in type_counts.items():
        cnt = v["count"]
        pct = round((cnt / total * 100), 1) if total > 0 else 0.0
        types_list.append({
            "type": k,
            "label": v["label"],
            "count": cnt,
            "scams": v["scams"],
            "percentage": pct,
            "color": v["color"]
        })

    return {"total": total, "types": types_list}

async def get_risk_scores(days: Optional[int] = None) -> dict:
    store = get_store()
    items = filter_by_days(store["scan_history"], days)
    total = len(items)

    buckets = [
        {"range": "0–20", "count": 0, "risk": "Low", "color": "#22c55e"},
        {"range": "21–40", "count": 0, "risk": "Moderate", "color": "#84cc16"},
        {"range": "41–60", "count": 0, "risk": "Medium", "color": "#f59e0b"},
        {"range": "61–80", "count": 0, "risk": "High", "color": "#f97316"},
        {"range": "81–100", "count": 0, "risk": "Critical", "color": "#ef4444"},
    ]

    for i in items:
        score = i.get("risk_score", 0)
        if score <= 20:
            buckets[0]["count"] += 1
        elif score <= 40:
            buckets[1]["count"] += 1
        elif score <= 60:
            buckets[2]["count"] += 1
        elif score <= 80:
            buckets[3]["count"] += 1
        else:
            buckets[4]["count"] += 1

    for b in buckets:
        b["percentage"] = round((b["count"] / total * 100), 1) if total > 0 else 0.0

    return {"total": total, "scores": buckets}
