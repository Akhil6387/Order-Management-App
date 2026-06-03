from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.customer_service import CustomerService
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=SuccessResponse)
def get_customers(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    customers, total = CustomerService.get_all(db, search=search, skip=skip, limit=limit)
    return {
        "success": True,
        "message": "Customers retrieved successfully",
        "data": {"items": [CustomerResponse.model_validate(c) for c in customers], "total": total},
    }


@router.post("", response_model=SuccessResponse, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = CustomerService.create(db, payload)
    return {
        "success": True,
        "message": "Customer created successfully",
        "data": CustomerResponse.model_validate(customer),
    }


@router.get("/{customer_id}", response_model=SuccessResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = CustomerService.get_by_id(db, customer_id)
    return {
        "success": True,
        "message": "Customer retrieved successfully",
        "data": CustomerResponse.model_validate(customer),
    }


@router.delete("/{customer_id}", response_model=SuccessResponse)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService.delete(db, customer_id)
    return {"success": True, "message": "Customer deleted successfully", "data": None}
