
# ScamShield

# 🛡️ ScamShield – AI-Powered Scam Detection Platform

> **"Think Before You Click. Stay Safe with ScamShield."**  
> *Developed by Team BrainByte*

---

## 🚀 Quick Start (Single Command Execution)

You can launch both the **FastAPI Backend** and the **React + Vite Frontend** simultaneously with a single command:

### Option A: Using Python
```bash
python run.py
```

### Option B: Windows Batch Script
Double-click `start.bat` or run:
```cmd
start.bat
```

### Option C: Stopping All Services
Double-click `stop.bat` or press `Ctrl+C` in the running terminal.

---

### Expected Startup Output
```text
[ScamShield] Starting application...

[1/2] Starting FastAPI Backend...
Backend: http://127.0.0.1:8000

[2/2] Starting React Frontend...
Frontend: http://127.0.0.1:5173

[ScamShield] Checking backend health...
[ScamShield] Backend is healthy: HTTP 200

[ScamShield] Application started successfully!

Open: http://127.0.0.1:5173
```

---

## 📊 Advanced Analytics Dashboard

The ScamShield dashboard features real-time threat intelligence derived directly from recorded scans:

1. **Overall Detection Metrics**:
   - Total Scans
   - Scams Detected
   - Suspicious Messages
   - Safe Messages
   - Period-over-period percentage changes and trend indicators
2. **Scam Distribution (Donut Chart)**:
   - Proportional breakdown of Scam, Suspicious, and Safe messages
   - Total scans center label, interactive hover tooltips, and legend
3. **Top Scam Categories (Bar Chart)**:
   - Live ranking of detected threat categories (e.g., UPI Fraud, Fake KYC, OTP Theft, Digital Arrest)
   - Real-time frequency counts and risk levels
4. **Daily Detection Trends (Line Chart)**:
   - Day-by-day continuous timeline showing scan volume and severity distribution
5. **Risk Stratification Over Time (Area Chart)**:
   - Low (0–29), Medium (30–69), and High (70–100) risk score trends
6. **Input Source Breakdown (Pie / Donut Chart)**:
   - Threat vector origin analysis: Text messages, Chat screenshots, Audio recordings, and URLs
7. **Risk Score Distribution (Histogram)**:
   - Score bucketing across 0–20, 21–40, 41–60, 61–80, and 81–100 ranges
8. **Recent Detections Table**:
   - Real-time inspection of recent scans with risk scores, categories, and direct details

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS + Lucide React Icons
  - Recharts for responsive SVG visualizations
  - Axios centralized API client
- **Backend**:
  - Python 3.12 + FastAPI
  - Pydantic validation & schemas
  - Rule-based + AI scam detection engine
  - Persistent JSON database storage with MongoDB compatibility
  - Asynchronous non-blocking architecture
- **Security & Safety**:
  - Official Indian Cybercrime Reporting: **Helpline 1930**
  - National Cyber Crime Reporting Portal: `https://cybercrime.gov.in`

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint (HTTP 200) |
| `GET` | `/api/dashboard/stats?days=7` | Summary statistics and trend percentages |
| `GET` | `/api/analytics/scam-distribution` | Donut chart distribution data |
| `GET` | `/api/analytics/scam-categories` | Top scam categories ranked by frequency |
| `GET` | `/api/analytics/daily-trends` | Continuous daily timeline data |
| `GET` | `/api/analytics/risk-distribution` | Area chart risk stratification over time |
| `GET` | `/api/analytics/input-types` | Breakdown by input vector (text, image, audio, url) |
| `GET` | `/api/analytics/risk-scores` | Risk score histogram buckets |
| `POST` | `/api/analyze/message` | AI message text scam analysis |
| `POST` | `/api/analyze/image` | Screenshot OCR extraction and threat analysis |
| `POST` | `/api/analyze/audio` | Speech-to-text transcription and scam analysis |
| `POST` | `/api/analyze/url` | Phishing URL heuristic detection |
| `GET` | `/api/history` | Paginated scan history with search |
| `GET` | `/api/contacts` | Trusted family contacts list |
| `POST` | `/api/alerts/send` | Consent-based family protection alert |

FastAPI Interactive Documentation: **http://127.0.0.1:8000/docs**
