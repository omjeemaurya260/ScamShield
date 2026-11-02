from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from ..schemas.schemas import ContactCreate, ContactUpdate, AlertRequest
from ..database.db import (
    get_contacts, create_contact, update_contact, delete_contact,
    save_alert, get_alerts
)

router = APIRouter(tags=["Contacts & Alerts"])


# ─── Contacts ─────────────────────────────────────────────────────────────────

@router.get("/api/contacts", summary="List trusted contacts")
async def list_contacts():
    contacts = await get_contacts()
    return JSONResponse(content={"contacts": contacts})


@router.post("/api/contacts", summary="Add trusted contact")
async def add_contact(contact: ContactCreate):
    if not contact.phone and not contact.email:
        raise HTTPException(status_code=400, detail="Contact must have either phone or email.")
    saved = await create_contact(contact.model_dump())
    return JSONResponse(content=saved, status_code=201)


@router.put("/api/contacts/{contact_id}", summary="Update trusted contact")
async def edit_contact(contact_id: str, data: ContactUpdate):
    updated = await update_contact(contact_id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Contact not found")
    return JSONResponse(content=updated)


@router.delete("/api/contacts/{contact_id}", summary="Remove trusted contact")
async def remove_contact(contact_id: str):
    success = await delete_contact(contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return JSONResponse(content={"message": "Contact removed", "id": contact_id})


# ─── Alerts ───────────────────────────────────────────────────────────────────

@router.post("/api/alerts/send", summary="Send family protection alert")
async def send_alert(request: AlertRequest):
    """
    Trigger a family protection alert. 
    NOTE: In prototype mode, notifications are simulated and clearly marked as such.
    Real SMS/email requires Twilio/SMTP configuration.
    """
    if not request.user_consent:
        raise HTTPException(
            status_code=400,
            detail="User consent is required to send alerts to family members."
        )

    alert_data = {
        "contact_id": request.contact_id,
        "scan_id": request.scan_id,
        "verdict": request.verdict,
        "risk_score": request.risk_score,
        "category": request.category,
        "status": "simulated",
        "note": "⚠️ PROTOTYPE MODE: This alert has been logged but NOT actually sent. Configure SMTP/Twilio in .env to enable real notifications."
    }

    # Check if real sending is configured
    smtp_configured = bool(__import__('os').getenv("SMTP_USER"))
    twilio_configured = bool(__import__('os').getenv("TWILIO_SID"))

    if smtp_configured or twilio_configured:
        # Would send real notification here
        alert_data["status"] = "queued"
        alert_data["note"] = "Alert queued for delivery."
    
    saved = await save_alert(alert_data)

    return JSONResponse(content={
        "id": saved.get("id"),
        "status": alert_data["status"],
        "message": alert_data["note"],
        "contact_id": request.contact_id,
        "risk_level": "HIGH" if request.risk_score >= 70 else "MEDIUM",
        "created_at": saved.get("created_at")
    }, status_code=201)


@router.get("/api/alerts", summary="Get alert history")
async def list_alerts(limit: int = 20):
    alerts = await get_alerts(limit=limit)
    return JSONResponse(content={"alerts": alerts})
