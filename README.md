# SiPinjam Kampus

> **Sistem Manajemen Peminjaman Peralatan Laboratorium dan Reservasi Ruangan Kampus**

A production-quality, full-stack campus borrowing management system that eliminates manual record-keeping, prevents double bookings, and provides a complete audit trail of all equipment loans and room reservations.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Domain Models](#domain-models)
- [Business Rules](#business-rules)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Running Tests](#running-tests)
- [Production Deployment](#production-deployment)

---

## Project Overview

SiPinjam Kampus solves critical pain points in campus resource management:

| Problem | Solution |
|---------|----------|
| Lost borrowing records | Persistent database with full audit trail |
| Unknown borrower tracking | User accounts with RBAC |
| Double-booked rooms | Service-layer conflict detection with time-window overlap algorithm |
| Approval mistakes | Structured PENDING → APPROVED/REJECTED → COMPLETED workflow |
| Poor history management | Searchable, filterable loan history per user |
| Manual return processing | Integrated QR/Barcode Scanner (`html5-qrcode`) for quick return |
| Visualizing schedules | Interactive Calendar View (`react-big-calendar`) |
| Unappealing UI | Modern, responsive SaaS design with soft UI aesthetics |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Monorepo Root                        │
│                                                         │
│  apps/                                                  │
│  ├── backend/          FastAPI (Python 3.12)            │
│  │   ├── api/          HTTP routes (thin layer)         │
│  │   ├── services/     Business logic (BorrowingService)│
│  │   ├── repositories/ Data access layer                │
│  │   ├── models/       SQLModel ORM entities            │
│  │   ├── schemas/      Pydantic v2 DTOs                 │
│  │   ├── core/         Config, security, JWT            │
│  │   └── db/           Database engine & session        │
│  │                                                      │
│  └── frontend/         React + Vite + TailwindCSS       │
│      ├── pages/        Route-level components           │
│      ├── components/   Shared UI components             │
│      ├── hooks/        TanStack Query + Auth hooks      │
│      ├── services/     Axios API clients                │
│      ├── routes/       Route guards (Protected/Admin)   │
│      └── layouts/      AppLayout sidebar                │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture Patterns

- **Service Layer Pattern**: All business logic lives exclusively in `services/`. Routes delegate to services and never contain domain logic.
- **Repository Pattern**: All database queries are isolated in `repositories/`. Services depend on repository interfaces.
- **Dependency Injection**: FastAPI `Depends()` wires repositories → services → routes automatically.
- **SOLID Principles**: Single Responsibility (each class has one job), Open/Closed (extend without modifying), Liskov (substitutable), Interface Segregation, Dependency Inversion.

---

## Folder Structure

```
SiPinjam Kampus Web/
│
├── apps/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── deps.py             # Dependency injection container
│   │   │   │   ├── router.py           # API v1 router aggregator
│   │   │   │   └── routes/
│   │   │   │       ├── auth.py         # POST /auth/register, /login, GET /me
│   │   │   │       ├── items.py        # CRUD /items
│   │   │   │       ├── rooms.py        # CRUD /rooms
│   │   │   │       ├── loans.py        # /loans + approval workflow
│   │   │   │       └── uploads.py      # /uploads/image endpoint
│   │   │   ├── core/
│   │   │   │   ├── config.py           # Pydantic Settings (env-based)
│   │   │   │   └── security.py        # JWT + bcrypt
│   │   │   ├── db/
│   │   │   │   └── session.py          # Engine + get_session dependency
│   │   │   ├── models/
│   │   │   │   ├── enums.py            # UserRole, ResourceType, LoanStatus
│   │   │   │   ├── user.py             # User SQLModel
│   │   │   │   ├── item.py             # Item SQLModel
│   │   │   │   ├── room.py             # Room SQLModel
│   │   │   │   └── loan.py             # Loan SQLModel
│   │   │   ├── schemas/
│   │   │   │   ├── user.py             # UserRegister, UserLogin, UserResponse
│   │   │   │   ├── item.py             # ItemCreate, ItemUpdate, ItemResponse
│   │   │   │   ├── room.py             # RoomCreate, RoomUpdate, RoomResponse
│   │   │   │   └── loan.py             # LoanCreate, LoanResponse, AvailabilityResponse
│   │   │   ├── repositories/
│   │   │   │   ├── user_repository.py
│   │   │   │   ├── item_repository.py
│   │   │   │   ├── room_repository.py
│   │   │   │   └── loan_repository.py  # Time-window overlap conflict query
│   │   │   ├── services/
│   │   │   │   ├── auth_service.py
│   │   │   │   ├── item_service.py
│   │   │   │   ├── room_service.py
│   │   │   │   └── borrowing_service.py  # Core domain service
│   │   │   └── main.py                   # FastAPI app factory
│   │   ├── migrations/
│   │   │   ├── env.py
│   │   │   └── versions/001_initial.py
│   │   ├── tests/
│   │   │   ├── conftest.py
│   │   │   ├── test_borrowing_service.py
│   │   │   ├── test_item_room_service.py
│   │   │   └── test_api.py
│   │   ├── alembic.ini
│   │   ├── pytest.ini
│   │   └── requirements.txt
│   │
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── ItemsPage.tsx
│       │   │   ├── RoomsPage.tsx
│       │   │   ├── LoanRequestPage.tsx
│       │   │   ├── LoanHistoryPage.tsx
│       │   │   ├── AdminApprovalPage.tsx
│       │   │   ├── CalendarPage.tsx    # Visual schedule view
│       │   │   └── ScannerPage.tsx     # QR Scanner for quick returns
│       │   ├── components/
│       │   │   ├── LoadingSpinner.tsx
│       │   │   ├── StatusBadge.tsx
│       │   │   └── ConfirmDialog.tsx
│       │   ├── hooks/
│       │   │   ├── useAuth.tsx         # Auth context + localStorage
│       │   │   ├── useItems.ts         # TanStack Query hooks
│       │   │   ├── useRooms.ts
│       │   │   └── useLoans.ts
│       │   ├── services/
│       │   │   ├── apiClient.ts        # Axios with JWT interceptor
│       │   │   ├── authService.ts
│       │   │   ├── itemService.ts
│       │   │   ├── roomService.ts
│       │   │   ├── loanService.ts
│       │   │   └── uploadService.ts    # File uploads api client
│       │   ├── layouts/
│       │   │   └── AppLayout.tsx       # Responsive sidebar layout
│       │   ├── routes/
│       │   │   ├── ProtectedRoute.tsx
│       │   │   └── AdminRoute.tsx
│       │   ├── types/index.ts          # TypeScript domain types
│       │   ├── App.tsx                 # Router setup
│       │   ├── main.tsx                # ReactDOM render
│       │   └── index.css               # Tailwind + component classes
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── package.json
│
├── docs/
├── package.json                        # Workspace root
└── README.md
```

---

## Domain Models

### User

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| name | string | Full name |
| email | string | Unique email |
| password_hash | string | bcrypt hash |
| role | UserRole | ADMIN \| BORROWER |
| is_active | bool | Soft disable flag |

### Item

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| code | string | Unique item code (e.g. IT001) |
| name | string | Equipment name |
| quantity | int | Total available units |
| description | string? | Optional description |
| category | string? | Item category |
| image_url | string? | Link to uploaded item image |

### Room

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| code | string | Unique room code (e.g. R101) |
| name | string | Room name |
| capacity | int | Max occupants |
| location | string? | Room location/building |
| image_url | string? | Link to uploaded room image |

### Loan

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| borrower_id | int | FK → users.id |
| resource_type | ResourceType | ITEM \| ROOM |
| resource_id | int | FK to item or room |
| date | date | Loan date |
| start_time | time | Start of usage |
| end_time | time | End of usage |
| purpose | string | Stated purpose |
| status | LoanStatus | PENDING → APPROVED/REJECTED → COMPLETED |
| approved_by | int? | Admin who processed |

---

## Business Rules

1. **No double-booking**: Rooms cannot have overlapping approved loans for the same time window.
2. **Quantity limit**: Item borrows cannot exceed available quantity in the same time window.
3. **Admin-only actions**: Only ADMIN can approve, reject, and complete loans.
4. **Borrower scope**: BORROWER can submit requests and view only their own loans.
5. **Re-check on approve**: Every approval re-validates availability to prevent race conditions.
6. **Conflict detection**: Implemented in `BorrowingService` using `A.start < B.end AND A.end > B.start` overlap formula.

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login → JWT |
| GET | `/auth/me` | Bearer | Get current user |

### Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/items` | Bearer | List all items |
| GET | `/items/{id}` | Bearer | Get item by ID |
| POST | `/items` | Admin | Create item |
| PUT | `/items/{id}` | Admin | Update item |
| DELETE | `/items/{id}` | Admin | Soft-delete item |

### Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/rooms` | Bearer | List all rooms |
| GET | `/rooms/{id}` | Bearer | Get room by ID |
| POST | `/rooms` | Admin | Create room |
| PUT | `/rooms/{id}` | Admin | Update room |
| DELETE | `/rooms/{id}` | Admin | Soft-delete room |

### Loans

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/loans` | Bearer | List loans (admin=all, borrower=own) |
| GET | `/loans/{id}` | Bearer | Get single loan |
| POST | `/loans` | Bearer | Submit loan request |
| POST | `/loans/{id}/approve` | Admin | Approve loan |
| POST | `/loans/{id}/reject` | Admin | Reject loan |
| POST | `/loans/{id}/complete` | Admin | Complete loan |
| GET | `/loans/availability` | Bearer | Check time slot availability |

### Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/uploads/image` | Bearer | Upload an image file for item/room |

---

## Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm 8+ (workspace support)

### 1. Clone / navigate to project

```bash
cd "SiPinjam Kampus Web"
```

### 2. Backend setup

```bash
cd apps/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd apps/frontend
npm install
```

---

## Environment Setup

### Backend `.env`

Copy the example file and customize:

```bash
cd apps/backend
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

**Development `.env`:**

```env
DATABASE_URL=sqlite:///./sipinjam.db
SECRET_KEY=your-super-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

**Production `.env` (Turso LibSQL):**

```env
DATABASE_URL=libsql://your-database.turso.io?authToken=YOUR_TURSO_TOKEN
SECRET_KEY=production-secret-key-very-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=production
BACKEND_CORS_ORIGINS=["https://your-frontend-domain.com"]
```

### Frontend `.env` (optional)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

> In development, the Vite proxy in `vite.config.ts` forwards `/api` requests to `http://localhost:8000` automatically — no `.env` needed.

---

## Running the Backend

```bash
cd apps/backend

# Activate virtual environment first
venv\Scripts\activate   # Windows
source venv/bin/activate # macOS/Linux

# Option 1: Direct uvicorn (development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Python module
python -m uvicorn app.main:app --reload
```

The API will be available at:

- **API**: <http://localhost:8000/api/v1>
- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>
- **Health**: <http://localhost:8000/health>

### Database Migrations (Alembic)

```bash
cd apps/backend

# Generate a new migration (after model changes)
alembic revision --autogenerate -m "describe change"

# Apply all pending migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

> In development, `init_db()` is called on startup automatically, so migrations are optional.

### Seeding the Database

To populate an empty database with initial dummy data (admin accounts, regular users, items, and rooms), you can run the provided seed script:

```bash
cd apps/backend
python seed.py
```

The script will safely skip execution if the database already contains users.
Default Admin: `admin@kampus.ac.id` / `admin123`
Default User: `budi@kampus.ac.id` / `budi123`

---

## Running the Frontend

```bash
cd apps/frontend
npm run dev
```

Frontend will be available at **<http://localhost:5173>**

### Default Credentials

Register via the API or UI. To create an admin account, register with `"role": "ADMIN"` in the request body.

**Quick admin setup via API:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@kampus.ac.id","password":"admin123","role":"ADMIN"}'
```

---

## Running Tests

```bash
cd apps/backend

# Activate virtual environment
venv\Scripts\activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_borrowing_service.py -v

# Run with coverage
pip install pytest-cov
pytest --cov=app --cov-report=html

# Run specific test class
pytest tests/test_borrowing_service.py::TestRoomConflictDetection -v
```

### Test Coverage Areas

| Test File | Coverage |
|-----------|----------|
| `test_borrowing_service.py` | Room conflict detection, item quantity validation, approval workflow, rejection, admin enforcement, availability checks |
| `test_item_room_service.py` | Item/Room CRUD, code uniqueness, soft-delete |
| `test_api.py` | HTTP endpoint integration tests with FastAPI TestClient |

---

## Production Deployment

### Backend (e.g., Railway, Render, Fly.io)

1. Set `ENVIRONMENT=production` in environment variables
2. Set `DATABASE_URL` to your Turso LibSQL connection string
3. Set a strong `SECRET_KEY`
4. Set `BACKEND_CORS_ORIGINS` to your frontend URL

```bash
# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (e.g., Vercel, Netlify)

```bash
cd apps/frontend
npm run build
# dist/ folder is ready to deploy
```

Set environment variable:

```env
VITE_API_URL=https://your-backend-api.com/api/v1
```

---

## License

MIT License — © 2026 SiPinjam Kampus
