from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.dashboard_service import DashboardService
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=SuccessResponse)
def get_dashboard(db: Session = Depends(get_db)):
    stats = DashboardService.get_stats(db)
    return {
        "success": True,
        "message": "Dashboard data retrieved successfully",
        "data": stats,
    }
