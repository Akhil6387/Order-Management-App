from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem


class DashboardService:

    @staticmethod
    def get_stats(db: Session) -> dict:
        total_products = db.query(Product).count()
        total_customers = db.query(Customer).count()
        total_orders = db.query(Order).count()

        total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
        low_stock = db.query(Product).filter(Product.stock_quantity <= 10).all()

        recent_orders = (
            db.query(Order)
            .order_by(Order.created_at.desc())
            .limit(5)
            .all()
        )

        # Orders by status
        status_counts = (
            db.query(Order.status, func.count(Order.id))
            .group_by(Order.status)
            .all()
        )

        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "low_stock_count": len(low_stock),
            "low_stock_products": [
                {"id": p.id, "name": p.name, "sku": p.sku, "stock_quantity": p.stock_quantity}
                for p in low_stock[:5]
            ],
            "order_status_breakdown": {status: count for status, count in status_counts},
            "recent_orders": [
                {
                    "id": o.id,
                    "customer_id": o.customer_id,
                    "status": o.status,
                    "total_amount": float(o.total_amount),
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                }
                for o in recent_orders
            ],
        }
