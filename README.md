# 🏭 OMS — Order Management System

A production-ready, containerized Inventory & Order Management System built with **FastAPI**, **React**, and **PostgreSQL**.

---

## 🌟 Features

### Core
- **Product Management** — CRUD with unique SKU enforcement, stock tracking, price validation
- **Customer Management** — CRUD with unique email enforcement
- **Order Management** — Multi-item orders with automatic stock deduction and total calculation
- **Inventory Validation** — Orders blocked when stock is insufficient
- **Dashboard Analytics** — Revenue, counts, low-stock alerts, order status breakdown

### Technical
- RESTful API with consistent JSON response format
- Business rule enforcement at the service layer
- Automatic stock restoration on order deletion
- Search/filter on products and customers
- Order status lifecycle management
- Swagger docs at `/docs`

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic v2 |
| Database | PostgreSQL 15 |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| HTTP Client | Axios |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx (frontend) |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📁 Project Structure

```
oms/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, exception handlers
│   │   ├── database.py       # SQLAlchemy engine & session
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API route handlers
│   │   ├── services/         # Business logic layer
│   │   └── config/           # Settings from environment
│   ├── tests/                # Pytest API tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Dashboard, Products, Customers, Orders
│   │   ├── services/         # Axios API layer
│   │   ├── context/          # React Context global state
│   │   └── main.jsx
│   ├── nginx.conf            # Nginx SPA + API proxy config
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml        # Full stack orchestration
├── .env                      # Root environment variables
├── render.yaml               # Render deployment config
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- OR: Python 3.11+, Node.js 20+, PostgreSQL 15

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/oms.git
cd oms

# 2. Copy and configure environment
cp .env.example .env
# Edit .env to set a strong SECRET_KEY

# 3. Build and start all services
docker compose up --build

# 4. Open the app
# Frontend:  http://localhost
# API Docs:  http://localhost:8000/docs
```

---

### Option B — Local Development

#### Backend
```bash
cd backend

# Create virtualenv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Set DATABASE_URL to your local PostgreSQL connection

# Start the API
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

npm install

# Configure environment
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000

npm run dev
# Open http://localhost:5173
```

---

## 🔌 API Reference

Base URL: `http://localhost:8000/api/v1`

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products (supports `?search=`) |
| POST | `/products` | Create a product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

**Create Product payload:**
```json
{
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "stock_quantity": 150
}
```

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders |
| POST | `/orders` | Create order (validates stock) |
| GET | `/orders/{id}` | Get order with items |
| PATCH | `/orders/{id}/status` | Update order status |
| DELETE | `/orders/{id}` | Delete order (restores stock) |

**Create Order payload:**
```json
{
  "customer_id": 1,
  "notes": "Ship to warehouse B",
  "items": [
    { "product_id": 1, "quantity": 3 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get analytics summary |

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Insufficient stock for 'Wireless Mouse'. Available: 2, Requested: 5",
  "errors": []
}
```

---

## ⚙️ Environment Variables

### Root `.env` (Docker Compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `oms_db` | Database name |
| `POSTGRES_USER` | `oms_user` | DB username |
| `POSTGRES_PASSWORD` | `oms_pass` | DB password — **change in production** |
| `SECRET_KEY` | — | JWT secret — **required, 32+ chars** |
| `APP_ENV` | `production` | `development` or `production` |
| `CORS_ORIGINS` | `http://localhost` | Comma-separated allowed origins |
| `VITE_API_BASE_URL` | *(empty)* | Leave empty to use Nginx proxy |

### Backend `backend/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `CORS_ORIGINS` | Allowed frontend origins |

### Frontend `frontend/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## 🐳 Docker

### Individual service builds

```bash
# Build backend only
docker build -t oms-backend ./backend

# Build frontend only
docker build -t oms-frontend ./frontend
```

### Useful Docker Compose commands

```bash
# Start services in background
docker compose up -d

# View logs
docker compose logs -f backend

# Stop everything
docker compose down

# Destroy including database volume
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

---

## ☁️ Deployment

### Backend — Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set root directory to `backend/`
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database, copy the connection string to `DATABASE_URL`
7. Set all environment variables from the table above

Or use the included `render.yaml` for one-click deploy.

### Frontend — Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend/`
4. Set environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`
5. Deploy

---

## 🧪 Running Tests

```bash
cd backend

# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest tests/ -v

# With coverage
pytest tests/ -v --tb=short
```

Tests cover:
- Health endpoint
- Product CRUD + duplicate SKU rejection
- Customer creation + duplicate email rejection
- Order creation with correct total calculation
- Insufficient stock rejection
- Stock reduction after order

---

## 🔒 Business Rules

| Rule | Implementation |
|------|---------------|
| Unique SKU | DB unique constraint + service layer 400 error |
| Unique customer email | DB unique constraint + service layer 400 error |
| No negative price | Pydantic `ge=0` + DB check constraint |
| No negative stock | Pydantic `ge=0` + DB check constraint |
| Stock validation on order | `with_for_update()` row lock in service |
| Auto stock reduction | Applied atomically in order creation transaction |
| Auto total calculation | Summed from `unit_price × quantity` in backend |
| Stock restoration on delete | Order deletion restores all item quantities |

---

## 📸 Screenshots

> *(Add screenshots of Dashboard, Products, Customers, and Orders pages here)*

---

## 🔗 Links

- **Live Demo (Frontend):** https://oms.vercel.app
- **Live API:** https://oms-api.onrender.com
- **API Docs (Swagger):** https://oms-api.onrender.com/docs
- **Docker Hub:** https://hub.docker.com/r/Akhil6387/oms-backend
- **GitHub:** [https://github.com/Akhil6387/oms](https://github.com/Akhil6387/Order-Management-App)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
