from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from ..database.db import get_scan_history, get_scan_by_id, delete_scan, get_dashboard_stats

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("", summary="Get scan history")
async def list_history(
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
    search: str = Query(default="")
):
    """Retrieve paginated scan history with optional search."""
    items = await get_scan_history(limit=limit, skip=skip, search=search)
    return JSONResponse(content={"items": items, "count": len(items)})


@router.get("/{scan_id}", summary="Get a specific scan by ID")
async def get_history_item(scan_id: str):
    """Get detailed results for a specific scan."""
    item = await get_scan_by_id(scan_id)
    if not item:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return JSONResponse(content=item)


@router.delete("/{scan_id}", summary="Delete a scan record")
async def delete_history_item(scan_id: str):
    """Permanently delete a scan record."""
    success = await delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return JSONResponse(content={"message": "Scan record deleted successfully", "id": scan_id})


@router.get("/dashboard/stats", summary="Get dashboard statistics", tags=["Dashboard"])
async def dashboard_stats():
    """Get overview statistics for the dashboard."""
    stats = await get_dashboard_stats()
    return JSONResponse(content=stats)
