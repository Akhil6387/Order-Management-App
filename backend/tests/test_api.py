"""
Basic API tests for OMS backend.
Run with: pytest tests/ -v
"""
import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use a file-based SQLite so test engine and app engine share the same DB
SQLALCHEMY_TEST_URL = "sqlite:///./pytest_test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override DATABASE_URL before importing app
import os
os.environ["DATABASE_URL"] = SQLALCHEMY_TEST_URL

from app.database import Base, get_db
from app.main import app

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create tables once
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def uid():
    return str(uuid.uuid4())[:8].upper()


def make_product(name=None, sku=None, price=10.0, stock=50):
    return client.post("/api/v1/products", json={
        "name": name or f"Product-{uid()}",
        "sku": sku or f"SKU-{uid()}",
        "price": price,
        "stock_quantity": stock,
    })


def make_customer(name=None, email=None):
    return client.post("/api/v1/customers", json={
        "full_name": name or f"Customer {uid()}",
        "email": email or f"user-{uid()}@test.com",
    })


# ─── Health ─────────────────────────────────────────────────

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


# ─── Products ───────────────────────────────────────────────

def test_create_product():
    r = make_product(name="Widget", sku=f"WGT-{uid()}")
    assert r.status_code == 201
    assert r.json()["success"] is True


def test_duplicate_sku_rejected():
    sku = f"DUP-{uid()}"
    make_product(sku=sku)
    r = make_product(sku=sku)
    assert r.status_code == 400


def test_get_products():
    make_product()
    r = client.get("/api/v1/products")
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_update_product():
    p = make_product().json()["data"]
    r = client.put(f"/api/v1/products/{p['id']}", json={"price": 99.99})
    assert r.status_code == 200
    assert float(r.json()["data"]["price"]) == 99.99


def test_delete_product():
    p = make_product().json()["data"]
    r = client.delete(f"/api/v1/products/{p['id']}")
    assert r.status_code == 200
    r2 = client.get(f"/api/v1/products/{p['id']}")
    assert r2.status_code == 404


# ─── Customers ──────────────────────────────────────────────

def test_create_customer():
    email = f"jane-{uid()}@unique.com"
    r = make_customer(name="Jane Doe", email=email)
    assert r.status_code == 201
    assert r.json()["data"]["email"] == email


def test_duplicate_email_rejected():
    email = f"dup-{uid()}@test.com"
    make_customer(email=email)
    r = make_customer(email=email)
    assert r.status_code == 400


# ─── Orders ─────────────────────────────────────────────────

def test_create_order():
    p = make_product(price=25.0, stock=50).json()["data"]
    c = make_customer().json()["data"]
    r = client.post("/api/v1/orders", json={
        "customer_id": c["id"],
        "items": [{"product_id": p["id"], "quantity": 2}],
    })
    assert r.status_code == 201
    assert float(r.json()["data"]["total_amount"]) == 50.0


def test_insufficient_stock_rejected():
    p = make_product(stock=1).json()["data"]
    c = make_customer().json()["data"]
    r = client.post("/api/v1/orders", json={
        "customer_id": c["id"],
        "items": [{"product_id": p["id"], "quantity": 999}],
    })
    assert r.status_code == 400
    assert "Insufficient" in r.json()["detail"]


def test_stock_reduced_after_order():
    p = make_product(stock=20).json()["data"]
    c = make_customer().json()["data"]
    client.post("/api/v1/orders", json={
        "customer_id": c["id"],
        "items": [{"product_id": p["id"], "quantity": 5}],
    })
    updated = client.get(f"/api/v1/products/{p['id']}").json()["data"]
    assert updated["stock_quantity"] == 15


def test_order_total_auto_calculated():
    p1 = make_product(price=10.0, stock=50).json()["data"]
    p2 = make_product(price=5.0, stock=50).json()["data"]
    c = make_customer().json()["data"]
    r = client.post("/api/v1/orders", json={
        "customer_id": c["id"],
        "items": [
            {"product_id": p1["id"], "quantity": 3},
            {"product_id": p2["id"], "quantity": 4},
        ],
    })
    assert r.status_code == 201
    assert float(r.json()["data"]["total_amount"]) == 50.0  # 30 + 20


def test_delete_order_restores_stock():
    p = make_product(stock=10).json()["data"]
    c = make_customer().json()["data"]
    o = client.post("/api/v1/orders", json={
        "customer_id": c["id"],
        "items": [{"product_id": p["id"], "quantity": 3}],
    }).json()["data"]

    client.delete(f"/api/v1/orders/{o['id']}")
    restored = client.get(f"/api/v1/products/{p['id']}").json()["data"]
    assert restored["stock_quantity"] == 10
