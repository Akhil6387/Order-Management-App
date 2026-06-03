from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from typing import Optional


class ProductService:

    @staticmethod
    def get_all(db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 100):
        query = db.query(Product)
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                )
            )
        total = query.count()
        products = query.offset(skip).limit(limit).all()
        return products, total

    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        return product

    @staticmethod
    def create(db: Session, payload: ProductCreate) -> Product:
        # Check unique SKU
        existing = db.query(Product).filter(Product.sku == payload.sku).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{payload.sku}' already exists"
            )
        product = Product(**payload.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session, product_id: int, payload: ProductUpdate) -> Product:
        product = ProductService.get_by_id(db, product_id)
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product_id: int):
        product = ProductService.get_by_id(db, product_id)
        db.delete(product)
        db.commit()

    @staticmethod
    def get_low_stock(db: Session, threshold: int = 10):
        return db.query(Product).filter(Product.stock_quantity <= threshold).all()
