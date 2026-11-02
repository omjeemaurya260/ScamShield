from typing import Optional
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from ..database.db import (
    get_dashboard_stats,
    get_scam_distribution,
    get_scam_categories,
    get_daily_trends,
    get_risk_distribution,
    get_input_types,
    get_risk_scores,
)

router = APIRouter(tags=["Analytics & Dashboard"])

@router.get("/api/dashboard/stats", summary="Get overall detection stats")
async def dashboard_stats(days: Optional[int] = Query(default=None, ge=1, le=365)):
    """
    Returns total scans, scams, suspicious, safe counts, percentage changes vs previous period,
    and recent scan records.
    """
    stats = await get_dashboard_stats(days=days)
    return JSONResponse(content=stats)

@router.get("/api/analytics/scam-distribution", summary="Get scam distribution for donut chart")
async def scam_distribution(days: Optional[int] = Query(default=None, ge=1, le=365)):
    """
    Aggregates scam vs suspicious vs safe proportions with percentages.
    """
    data = await get_scam_distribution(days=days)
    return JSONResponse(content=data)

@router.get("/api/analytics/scam-categories", summary="Get top detected scam categories")
async def scam_categories(days: Optional[int] = Query(default=None, ge=1, le=365)):
    """
    Returns actual categories present in scans sorted from highest to lowest.
    """
    data = await get_scam_categories(days=days)
    return JSONResponse(content=data)

@router.get("/api/analytics/daily-trends", summary="Get daily scam detection trends")
async def daily_trends(days: Optional[int] = Query(default=7, ge=1, le=90)):
    """
    Returns day-by-day totals, scams, suspicious, and safe counts for the line chart.
    """
    data = await get_daily_trends(days=days)
    return JSONResponse(content=data)

@router.get("/api/analytics/risk-distribution", summary="Get risk distribution over time")
async def risk_distribution(days: Optional[int] = Query(default=7, ge=1, le=90)):
    """
    Returns time-series breakdown of Low (0-29), Medium (30-69), and High (70-100) risk scans for area chart.
    """
    data = await get_risk_distribution(days=days)
    return JSONResponse(content=data)

@router.get("/api/analytics/input-types", summary="Get scans by input source")
async def input_types(days: Optional[int] = Query(default=None, ge=1, le=365)):
    """
    Returns breakdown across text messages, screenshots, audio calls, and URLs.
    """
    data = await get_input_types(days=days)
    return JSONResponse(content=data)

@router.get("/api/analytics/risk-scores", summary="Get risk score bucket histogram")
async def risk_scores(days: Optional[int] = Query(default=None, ge=1, le=365)):
    """
    Returns histogram of scores in ranges 0-20, 21-40, 41-60, 61-80, 81-100.
    """
    data = await get_risk_scores(days=days)
    return JSONResponse(content=data)
