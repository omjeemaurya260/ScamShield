import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

load_dotenv()

from .routes.analyze import router as analyze_router
from .routes.history import router as history_router
from .routes.contacts import router as contacts_router
from .routes.analytics import router as analytics_router
from .database.db import init_db

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"


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
    allow_origins=CORS_ORIGINS,
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
    if (FRONTEND_DIST / "index.html").is_file():
        return FileResponse(FRONTEND_DIST / "index.html")
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


@app.api_route("/{full_path:path}", methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], include_in_schema=False)
async def frontend_or_not_found(full_path: str, request: Request):
    """Serve the SPA for browser routes while keeping unknown API paths as JSON 404s."""
    if full_path == "" or full_path.startswith("api/"):
        return JSONResponse(
            status_code=404,
            content={"detail": "Not Found"},
        )

    if request.method not in {"GET", "HEAD"} or not FRONTEND_DIST.is_dir():
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    requested_file = (FRONTEND_DIST / full_path).resolve()
    try:
        requested_file.relative_to(FRONTEND_DIST.resolve())
    except ValueError:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    if requested_file.is_file():
        return FileResponse(requested_file)

    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"detail": "Frontend build not found"})


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc), "status_code": 500}
    )
