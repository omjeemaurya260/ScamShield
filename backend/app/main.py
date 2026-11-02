import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from .routes.analyze import router as analyze_router
from .routes.history import router as history_router
from .routes.contacts import router as contacts_router
from .routes.analytics import router as analytics_router
from .database.db import init_db

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[ScamShield] Initializing services...")
    await init_db()
    print("[ScamShield] API is operational and ready.")
    yield
    print("[ScamShield] API shutting down...")


app = FastAPI(
    title="ScamShield API",
    description="""
## ScamShield – AI-Powered Scam Detection API

**Developed by Team BrainByte**

This API powers the ScamShield platform for detecting online scams including:
- SMS/WhatsApp/Email message analysis
- Screenshot OCR scanning  
- Call recording transcription and analysis
- Phishing URL detection
- Family protection alerts
- Advanced Analytics & Threat Trends

### Security Note
Rate limiting and input validation are active. Sensitive data is protected.

### Reporting
- **Cybercrime Helpline:** 1930
- **Cybercrime Portal:** https://cybercrime.gov.in
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(analyze_router)
app.include_router(history_router)
app.include_router(contacts_router)
app.include_router(analytics_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "ScamShield API",
        "version": "1.0.0",
        "team": "BrainByte",
        "status": "operational",
        "docs": "/docs",
        "message": "Think Before You Click. Stay Safe with ScamShield."
    }


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "ScamShield API", "code": 200}


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc), "status_code": 500}
    )
