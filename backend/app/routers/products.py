from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.product_service import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=SuccessResponse)
def get_products(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    products, total = ProductService.get_all(db, search=search, skip=skip, limit=limit)
    return {
        "success": True,
        "message": "Products retrieved successfully",
        "data": {"items": [ProductResponse.model_validate(p) for p in products], "total": total},
    }


@router.post("", response_model=SuccessResponse, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = ProductService.create(db, payload)
    return {
        "success": True,
        "message": "Product created successfully",
        "data": ProductResponse.model_validate(product),
    }


@router.get("/{product_id}", response_model=SuccessResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = ProductService.get_by_id(db, product_id)
    return {
        "success": True,
        "message": "Product retrieved successfully",
        "data": ProductResponse.model_validate(product),
    }


@router.put("/{product_id}", response_model=SuccessResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = ProductService.update(db, product_id, payload)
    return {
        "success": True,
        "message": "Product updated successfully",
        "data": ProductResponse.model_validate(product),
    }


@router.delete("/{product_id}", response_model=SuccessResponse)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    ProductService.delete(db, product_id)
    return {"success": True, "message": "Product deleted successfully", "data": None}
