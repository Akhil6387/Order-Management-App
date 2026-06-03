from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from decimal import Decimal
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderStatusUpdate
from typing import Optional


class OrderService:

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100):
        query = db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.order_items).joinedload(OrderItem.product),
        ).order_by(Order.created_at.desc())
        total = db.query(Order).count()
        orders = query.offset(skip).limit(limit).all()
        return orders, total

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Order:
        order = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.order_items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        return order

    @staticmethod
    def create(db: Session, payload: OrderCreate) -> Order:
        # Validate customer exists
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {payload.customer_id} not found"
            )

        # Validate all products and check stock
        product_map = {}
        for item in payload.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {item.product_id} not found"
                )
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. "
                           f"Available: {product.stock_quantity}, Requested: {item.quantity}"
                )
            product_map[item.product_id] = product

        # Create order
        order = Order(
            customer_id=payload.customer_id,
            notes=payload.notes,
            status="pending",
            total_amount=Decimal("0"),
        )
        db.add(order)
        db.flush()  # Get order ID without committing

        # Create order items and reduce stock
        total = Decimal("0")
        for item in payload.items:
            product = product_map[item.product_id]
            unit_price = Decimal(str(product.price))
            subtotal = unit_price * item.quantity
            total += subtotal

            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
            db.add(order_item)

            # Reduce stock
            product.stock_quantity -= item.quantity

        order.total_amount = total
        db.commit()
        db.refresh(order)

        # Return with relationships loaded
        return OrderService.get_by_id(db, order.id)

    @staticmethod
    def update_status(db: Session, order_id: int, payload: OrderStatusUpdate) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        order.status = payload.status
        db.commit()
        return OrderService.get_by_id(db, order_id)

    @staticmethod
    def delete(db: Session, order_id: int):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        # Restore stock on deletion
        for item in order.order_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
        db.delete(order)
        db.commit()
