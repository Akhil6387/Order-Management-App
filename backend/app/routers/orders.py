from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=SuccessResponse)
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    orders, total = OrderService.get_all(db, skip=skip, limit=limit)
    return {
        "success": True,
        "message": "Orders retrieved successfully",
        "data": {"items": [OrderResponse.model_validate(o) for o in orders], "total": total},
    }


@router.post("", response_model=SuccessResponse, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    order = OrderService.create(db, payload)
    return {
        "success": True,
        "message": "Order created successfully",
        "data": OrderResponse.model_validate(order),
    }


@router.get("/{order_id}", response_model=SuccessResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = OrderService.get_by_id(db, order_id)
    return {
        "success": True,
        "message": "Order retrieved successfully",
        "data": OrderResponse.model_validate(order),
    }


@router.patch("/{order_id}/status", response_model=SuccessResponse)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = OrderService.update_status(db, order_id, payload)
    return {
        "success": True,
        "message": "Order status updated successfully",
        "data": OrderResponse.model_validate(order),
    }


@router.delete("/{order_id}", response_model=SuccessResponse)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    OrderService.delete(db, order_id)
    return {"success": True, "message": "Order deleted successfully", "data": None}
