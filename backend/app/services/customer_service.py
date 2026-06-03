from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate
from typing import Optional


class CustomerService:

    @staticmethod
    def get_all(db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 100):
        query = db.query(Customer)
        if search:
            query = query.filter(
                or_(
                    Customer.full_name.ilike(f"%{search}%"),
                    Customer.email.ilike(f"%{search}%"),
                )
            )
        total = query.count()
        customers = query.offset(skip).limit(limit).all()
        return customers, total

    @staticmethod
    def get_by_id(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {customer_id} not found"
            )
        return customer

    @staticmethod
    def create(db: Session, payload: CustomerCreate) -> Customer:
        existing = db.query(Customer).filter(Customer.email == payload.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{payload.email}' already exists"
            )
        customer = Customer(**payload.model_dump())
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete(db: Session, customer_id: int):
        customer = CustomerService.get_by_id(db, customer_id)
        db.delete(customer)
        db.commit()
