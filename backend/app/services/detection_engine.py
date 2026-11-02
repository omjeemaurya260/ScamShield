import re
import json
from typing import Optional
from datetime import datetime

# ─── Scam keywords and patterns ───────────────────────────────────────────────

SCAM_PATTERNS = {
    "kyc_phishing": {
        "keywords": [
            "kyc", "kyc update", "kyc verification", "kyc expire", "kyc block",
            "verify kyc", "complete kyc", "pan card", "aadhar", "aadhaar",
            "account blocked", "account suspended", "account deactivated",
            "kyc समाप्त", "kyc अपडेट", "खाता बंद"
        ],
        "weight": 30,
        "category": "KYC Phishing"
    },
    "upi_scam": {
        "keywords": [
            "upi", "gpay", "phonepe", "paytm", "bhim", "upi id", "upi pin",
            "send money", "transfer money", "payment link", "collect request",
            "upi घोटाला", "पैसे भेजें", "तुरंत भेजें"
        ],
        "weight": 25,
        "category": "UPI Payment Scam"
    },
    "otp_theft": {
        "keywords": [
            "otp", "one time password", "verification code", "share otp",
            "enter otp", "otp expired", "resend otp", "otp मत बताएं",
            "otp share", "do not share otp"
        ],
        "weight": 35,
        "category": "OTP Theft"
    },
    "bank_fraud": {
        "keywords": [
            "bank account", "credit card", "debit card", "cvv", "pin",
            "net banking", "internet banking", "atm pin", "card number",
            "expire card", "bank blocked", "बैंक खाता", "एटीएम पिन"
        ],
        "weight": 30,
        "category": "Bank Fraud"
    },
    "lottery_scam": {
        "keywords": [
            "lottery", "winner", "prize", "won", "congratulations", "claim prize",
            "lucky winner", "reward", "gift card", "cash prize", "jackpot",
            "लॉटरी", "इनाम", "जीत", "पुरस्कार"
        ],
        "weight": 25,
        "category": "Lottery/Prize Scam"
    },
    "job_scam": {
        "keywords": [
            "work from home", "part time job", "earn daily", "earn weekly",
            "no experience required", "hiring now", "urgent vacancy",
            "घर से काम", "पार्ट टाइम", "कमाई", "नौकरी"
        ],
        "weight": 20,
        "category": "Job Scam"
    },
    "parcel_scam": {
        "keywords": [
            "parcel", "courier", "delivery", "package", "shipment", "fedex",
            "dhl", "amazon delivery", "customs duty", "parcel blocked",
            "पार्सल", "कूरियर", "डिलीवरी", "कस्टम"
        ],
        "weight": 20,
        "category": "Parcel Delivery Scam"
    },
    "digital_arrest": {
        "keywords": [
            "digital arrest", "cyber crime", "cbi", "ed", "enforcement directorate",
            "narcotics", "money laundering", "arrest warrant", "police",
            "डिजिटल अरेस्ट", "सीबीआई", "पुलिस", "गिरफ्तारी"
        ],
        "weight": 40,
        "category": "Digital Arrest Scam"
    },
    "phishing_link": {
        "keywords": [
            "click here", "click link", "verify now", "login now", "update now",
            "http://", ".xyz", ".tk", ".ml", "bit.ly", "tinyurl", "goo.gl",
            "यहाँ क्लिक", "लिंक पर क्लिक"
        ],
        "weight": 25,
        "category": "Phishing Link"
    },
    "urgency_pressure": {
        "keywords": [
            "urgent", "immediately", "right now", "last chance", "expire soon",
            "act now", "don't delay", "तुरंत", "अभी", "जल्दी करें", "आखिरी मौका"
        ],
        "weight": 15,
        "category": "Urgency/Pressure Tactics"
    }
}

SAFE_PATTERNS = [
    "official website", "customer care", "1800", "toll free", "do not share",
    "never share", "bank will never ask", "beware of fraud"
]

SUSPICIOUS_URL_PATTERNS = [
    r"bit\.ly/", r"tinyurl\.com/", r"goo\.gl/", r"t\.co/",
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",  # IP address URL
    r"[a-z]+-[a-z]+-[a-z]+\.com",
    r"\.(xyz|tk|ml|ga|cf|click|loan|download)\b",
    r"(secure|verify|update|login|signin|account).*\.(com|in|net)",
]


def extract_keywords(text: str) -> list[dict]:
    """Extract suspicious keywords from message text."""
    text_lower = text.lower()
    found = []
    seen = set()

    for category, data in SCAM_PATTERNS.items():
        for kw in data["keywords"]:
            if kw.lower() in text_lower and kw.lower() not in seen:
                seen.add(kw.lower())
                found.append({
                    "keyword": kw,
                    "category": data["category"],
                    "weight": data["weight"]
                })
    return found


def calculate_risk_score(text: str, keywords: list[dict]) -> int:
    """Calculate a risk score 0-100 based on keywords and patterns."""
    score = 0
    text_lower = text.lower()

    # Base score from keywords
    added_categories = set()
    for kw in keywords:
        cat = kw["category"]
        if cat not in added_categories:
            score += kw["weight"]
            added_categories.add(cat)
        else:
            score += kw["weight"] * 0.3  # diminishing returns

    # URL pattern bonus
    for pattern in SUSPICIOUS_URL_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            score += 20
            break

    # Safe indicators reduce score
    for safe_kw in SAFE_PATTERNS:
        if safe_kw in text_lower:
            score -= 15

    # Clamp 0-100
    return max(0, min(100, int(score)))


def get_verdict(score: int, keywords: list[dict]) -> str:
    """Determine verdict based on risk score and detected patterns."""
    # Digital arrest or OTP theft are always SCAM
    high_risk_cats = {"Digital Arrest Scam", "OTP Theft", "KYC Phishing"}
    for kw in keywords:
        if kw["category"] in high_risk_cats and score >= 40:
            return "SCAM"

    if score >= 70:
        return "SCAM"
    elif score >= 30:
        return "SUSPICIOUS"
    else:
        return "SAFE"


def build_red_flags(keywords: list[dict], text: str) -> list[dict]:
    """Build red flag explanations from detected keywords."""
    flags = []
    seen_cats = set()

    for kw in keywords:
        cat = kw["category"]
        if cat in seen_cats:
            continue
        seen_cats.add(cat)

        explanations = {
            "KYC Phishing": "Message requests KYC update which banks never do via SMS/WhatsApp.",
            "UPI Payment Scam": "Contains UPI-related terms often used in payment scams.",
            "OTP Theft": "References OTP sharing which is a major red flag – never share OTPs.",
            "Bank Fraud": "Contains banking credentials references – legitimate banks never ask for these.",
            "Lottery/Prize Scam": "Prize/lottery claims without prior entry are classic scam tactics.",
            "Job Scam": "Work-from-home job offers with unrealistic earnings are usually scams.",
            "Parcel Delivery Scam": "Fake delivery notifications often lead to fraudulent payment pages.",
            "Digital Arrest Scam": "Fake digital arrest threats from 'CBI/Police' are a known scam.",
            "Phishing Link": "Contains suspicious URL – may lead to a fake website to steal credentials.",
            "Urgency/Pressure Tactics": "Creates artificial urgency to prevent the victim from thinking clearly.",
        }

        flags.append({
            "indicator": cat,
            "explanation": explanations.get(cat, f"Suspicious pattern detected: {cat}")
        })

    # URL in message flag
    if re.search(r"https?://", text) and any(re.search(p, text, re.IGNORECASE) for p in SUSPICIOUS_URL_PATTERNS):
        if "Phishing Link" not in seen_cats:
            flags.append({
                "indicator": "Suspicious URL detected",
                "explanation": "A potentially malicious link has been found in this message."
            })

    return flags


def generate_explanation(verdict: str, category: str, keywords: list[dict], language: str = "en") -> str:
    """Generate a human-readable explanation."""
    kw_list = ", ".join(set(k["keyword"] for k in keywords[:5])) if keywords else "none"

    if language == "hi":
        if verdict == "SCAM":
            return (
                f"यह संदेश एक {category} स्कैम की तरह दिखता है। "
                f"इसमें संदिग्ध शब्द मिले: {kw_list}। "
                "कृपया किसी लिंक पर क्लिक न करें, OTP न बताएं और अपनी बैंकिंग जानकारी साझा न करें। "
                "साइबर क्राइम हेल्पलाइन 1930 पर तुरंत रिपोर्ट करें।"
            )
        elif verdict == "SUSPICIOUS":
            return (
                f"यह संदेश संदिग्ध लगता है और {category} से संबंधित हो सकता है। "
                f"संदिग्ध शब्द: {kw_list}। "
                "सावधान रहें और कोई भी व्यक्तिगत जानकारी साझा करने से पहले सत्यापित करें।"
            )
        else:
            return "यह संदेश सुरक्षित लगता है। फिर भी सतर्क रहें और व्यक्तिगत जानकारी साझा करने से बचें।"
    else:
        if verdict == "SCAM":
            return (
                f"This message exhibits strong indicators of a {category}. "
                f"Suspicious keywords detected: {kw_list}. "
                "Do not click any links, share OTPs, or provide banking details. "
                "Report immediately to Cybercrime Helpline: 1930."
            )
        elif verdict == "SUSPICIOUS":
            return (
                f"This message shows suspicious characteristics possibly related to {category}. "
                f"Keywords found: {kw_list}. "
                "Exercise caution and verify through official channels before taking any action."
            )
        else:
            return "This message appears safe based on our analysis. However, always stay vigilant and avoid sharing personal information unnecessarily."


def get_recommendations(verdict: str, category: str, language: str = "en") -> list[str]:
    """Get actionable recommendations."""
    base_recs = {
        "en": {
            "SCAM": [
                "Do NOT click any links in this message.",
                "Do NOT share your OTP, PIN, or banking details with anyone.",
                "Block and report the sender immediately.",
                "Report on Cybercrime Portal: https://cybercrime.gov.in",
                "Call Cybercrime Helpline: 1930",
                "Inform your bank if financial details were already shared.",
            ],
            "SUSPICIOUS": [
                "Do not respond to this message immediately.",
                "Verify the sender's identity through official channels.",
                "Do not click unknown links.",
                "Contact the organization directly using their official number.",
                "If unsure, report at https://cybercrime.gov.in",
            ],
            "SAFE": [
                "Message appears safe, but stay vigilant.",
                "Never share OTPs or passwords with anyone.",
                "Use official apps for banking and payments.",
            ]
        },
        "hi": {
            "SCAM": [
                "इस संदेश में कोई लिंक क्लिक न करें।",
                "अपना OTP, PIN या बैंकिंग विवरण किसी को न बताएं।",
                "प्रेषक को तुरंत ब्लॉक करें और रिपोर्ट करें।",
                "साइबर क्राइम पोर्टल पर रिपोर्ट करें: https://cybercrime.gov.in",
                "हेल्पलाइन नंबर: 1930 पर कॉल करें।",
                "अगर बैंकिंग जानकारी शेयर हो गई है तो तुरंत बैंक से संपर्क करें।",
            ],
            "SUSPICIOUS": [
                "इस संदेश का तुरंत जवाब न दें।",
                "आधिकारिक चैनल के माध्यम से प्रेषक की पहचान सत्यापित करें।",
                "अज्ञात लिंक पर क्लिक न करें।",
                "आधिकारिक नंबर से संगठन से सीधे संपर्क करें।",
            ],
            "SAFE": [
                "संदेश सुरक्षित लगता है, लेकिन सतर्क रहें।",
                "कभी भी OTP या पासवर्ड किसी को न बताएं।",
                "बैंकिंग के लिए हमेशा आधिकारिक ऐप का उपयोग करें।",
            ]
        }
    }

    lang_recs = base_recs.get(language, base_recs["en"])
    recs = lang_recs.get(verdict, lang_recs["SAFE"])

    # Add category-specific recommendations
    category_recs = {
        "KYC Phishing": {
            "en": "Your bank will NEVER ask you to update KYC via SMS or WhatsApp.",
            "hi": "बैंक कभी भी SMS या WhatsApp पर KYC अपडेट नहीं मांगते।"
        },
        "Digital Arrest Scam": {
            "en": "There is NO such thing as 'Digital Arrest'. This is a known scam.",
            "hi": "'डिजिटल अरेस्ट' जैसी कोई चीज नहीं होती। यह एक जाना-माना स्कैम है।"
        },
        "OTP Theft": {
            "en": "OTP should NEVER be shared with anyone, even if they claim to be from your bank.",
            "hi": "OTP कभी किसी को न बताएं, चाहे वो बैंक का कर्मचारी क्यों न हो।"
        }
    }

    if category in category_recs and language in category_recs[category]:
        recs = [category_recs[category][language]] + recs

    return recs


def analyze_message(message: str, language: str = "en") -> dict:
    """
    Main rule-based scam analysis engine.
    Returns structured analysis result.
    """
    if not message or not message.strip():
        return {
            "verdict": "SAFE",
            "risk_score": 0,
            "category": "No Content",
            "confidence": 1.0,
            "red_flags": [],
            "keywords": [],
            "explanation": "No message content provided.",
            "recommendations": ["Please provide a message to analyze."],
            "analysis_method": "rule_based"
        }

    keywords = extract_keywords(message)
    risk_score = calculate_risk_score(message, keywords)
    verdict = get_verdict(risk_score, keywords)

    # Determine primary category
    if keywords:
        # Pick the highest-weight category
        primary = max(keywords, key=lambda x: x["weight"])
        category = primary["category"]
    else:
        category = "General Communication"

    red_flags = build_red_flags(keywords, message)
    explanation = generate_explanation(verdict, category, keywords, language)
    recommendations = get_recommendations(verdict, category, language)

    # Confidence based on number of indicators
    confidence = min(0.99, 0.5 + len(keywords) * 0.05 + (risk_score / 200))

    return {
        "verdict": verdict,
        "risk_score": risk_score,
        "category": category,
        "confidence": round(confidence, 2),
        "red_flags": red_flags,
        "keywords": [k["keyword"] for k in keywords],
        "explanation": explanation,
        "recommendations": recommendations,
        "analysis_method": "rule_based"
    }


def analyze_url_safety(url: str) -> dict:
    """Rule-based URL safety analysis."""
    import tldextract
    import validators

    result = {
        "url": url,
        "is_valid": False,
        "is_https": False,
        "domain": "",
        "tld": "",
        "risk_score": 0,
        "verdict": "SAFE",
        "suspicious_patterns": [],
        "recommendations": []
    }

    # Validate URL
    if not validators.url(url):
        result["verdict"] = "INVALID"
        result["recommendations"] = ["Please enter a valid URL."]
        return result

    result["is_valid"] = True
    result["is_https"] = url.startswith("https://")

    # Extract domain info
    ext = tldextract.extract(url)
    result["domain"] = f"{ext.domain}.{ext.suffix}"
    result["tld"] = ext.suffix
    result["subdomain"] = ext.subdomain

    score = 0

    # HTTPS check
    if not result["is_https"]:
        score += 20
        result["suspicious_patterns"].append({
            "pattern": "No HTTPS",
            "explanation": "The URL uses HTTP instead of HTTPS – insecure connection."
        })

    # Suspicious TLDs
    suspicious_tlds = ["xyz", "tk", "ml", "ga", "cf", "click", "loan", "download", "top", "win"]
    if ext.suffix in suspicious_tlds:
        score += 30
        result["suspicious_patterns"].append({
            "pattern": f"Suspicious TLD (.{ext.suffix})",
            "explanation": f"The .{ext.suffix} domain is commonly used in fraudulent websites."
        })

    # URL shorteners
    shorteners = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd"]
    if any(s in url for s in shorteners):
        score += 25
        result["suspicious_patterns"].append({
            "pattern": "URL Shortener",
            "explanation": "Short URLs hide the actual destination and are often used in phishing."
        })

    # IP address as domain
    if re.match(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url):
        score += 35
        result["suspicious_patterns"].append({
            "pattern": "IP Address URL",
            "explanation": "Legitimate websites use domain names, not IP addresses."
        })

    # Suspicious keywords in URL
    suspicious_url_keywords = [
        "login", "signin", "verify", "update", "secure", "account",
        "banking", "paypal", "amazon", "google", "microsoft", "apple"
    ]
    domain_lower = ext.domain.lower()
    for kw in suspicious_url_keywords:
        if kw in domain_lower and kw != ext.domain:  # keyword stuffed
            score += 20
            result["suspicious_patterns"].append({
                "pattern": f"Keyword stuffing: '{kw}'",
                "explanation": f"The domain contains '{kw}' which may be impersonating a legitimate service."
            })
            break

    # Excessive subdomains
    if ext.subdomain and ext.subdomain.count(".") >= 2:
        score += 15
        result["suspicious_patterns"].append({
            "pattern": "Excessive subdomains",
            "explanation": "Multiple subdomain levels can be used to disguise phishing URLs."
        })

    # Hyphen-heavy domain (lookalike)
    if domain_lower.count("-") >= 2:
        score += 15
        result["suspicious_patterns"].append({
            "pattern": "Hyphen-heavy domain",
            "explanation": "Domains with many hyphens are often used to mimic legitimate sites."
        })

    result["risk_score"] = min(100, score)
    if score >= 70:
        result["verdict"] = "DANGEROUS"
    elif score >= 30:
        result["verdict"] = "SUSPICIOUS"
    else:
        result["verdict"] = "SAFE"

    # Recommendations
    if result["verdict"] == "DANGEROUS":
        result["recommendations"] = [
            "Do NOT visit this URL.",
            "This URL shows multiple high-risk indicators.",
            "Report it at https://cybercrime.gov.in",
            "Warn others who may have received this link."
        ]
    elif result["verdict"] == "SUSPICIOUS":
        result["recommendations"] = [
            "Exercise extreme caution before visiting.",
            "Verify the URL through the official website of the organization.",
            "Do not enter any personal information on this site.",
            "Check with the sender before clicking."
        ]
    else:
        result["recommendations"] = [
            "URL appears relatively safe, but always stay vigilant.",
            "Ensure the site uses HTTPS and has a valid certificate.",
            "Never enter sensitive info on unfamiliar websites."
        ]

    return result
