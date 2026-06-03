from pydantic import BaseModel
from typing import Any, Optional, List


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: List[str] = []


class PaginatedResponse(BaseModel):
    success: bool = True
    message: str = "Data retrieved successfully"
    data: List[Any] = []
    total: int = 0
    page: int = 1
    per_page: int = 20
    total_pages: int = 1
