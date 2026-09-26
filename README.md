# 📦 StockSense — Inventory Management System

<div align="center">

![StockSense Banner](https://img.shields.io/badge/StockSense-Inventory%20Management-3B82F6?style=for-the-badge&logo=box&logoColor=white)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

> A modular, real-time Inventory Management System that replaces manual registers, Excel sheets, and scattered tracking with a centralized, database-driven, enterprise-grade application.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Database Design](#-database-design) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Screenshots](#-screenshots)

</div>

---

## 🎯 Problem Statement

Businesses today rely on manual registers, spreadsheets, and disconnected tools to manage inventory — leading to stock mismatches, delays, and costly human errors. **StockSense** solves this with a single, real-time platform to manage all stock operations across warehouses, teams, and locations.

---

## 👥 Target Users

| Role | Responsibility |
|------|----------------|
| 📋 **Inventory Manager** | Validate receipts, deliveries, adjustments. Full system access. |
| 🏭 **Warehouse Staff** | Create drafts, perform transfers, picking, shelving, and counting. |

---

## ✨ Features

### 🔐 Authentication & Security
- Secure sign up / log in with **bcrypt** password hashing
- **JWT access tokens** + **refresh tokens** (dual-token strategy)
- **OTP-based password reset** via email
- **Role-Based Access Control** (Manager vs Staff)
- Rate limiting on auth routes (brute-force prevention)
- HTTP security headers via **Helmet.js**

### 📊 Real-Time Dashboard
- **Live KPIs** — Total Stock, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries
- **Stock movement chart** — line chart of in/out/transfer over the last 7 days
- **Top 5 low-stock products** with urgency color indicator
- **Live activity feed** — "John validated Receipt #42 · 2 min ago"
- All data updates in **real-time via WebSockets** — zero page refresh

### 📦 Product Management
- Create products with Name, SKU, Category, Unit of Measure, Reorder Level
- Stock availability broken down **per warehouse and per location (rack-level)**
- Product categories with hierarchical support
- Reordering rules with auto low-stock alerts
- **Inline search** — debounced, searches as you type across name/SKU/category
- Stock level shown as **color-coded progress bar** per location

### 🚚 Receipts (Incoming Goods)
- Create receipt → add supplier & line items → validate
- Status flow: `Draft → Waiting → Ready → Done`
- On validation: stock **automatically increases** via stock ledger entry
- Auto-calculated totals as lines are added

### 📤 Delivery Orders (Outgoing Goods)
- Pick → Pack → Validate workflow
- On validation: stock **automatically decreases** via stock ledger entry
- Stock **reservation** when status is "Ready" (prevents double-selling)

### 🔄 Internal Transfers
- Move stock between any two warehouses or rack locations
- Every movement logged in the stock ledger with full traceability
- Example: `Main Warehouse → Production Floor`, `Rack A → Rack B`

### 🛠️ Stock Adjustments
- Fix mismatches between recorded and physical count
- Select product + location → enter physical quantity → system auto-calculates delta
- Adjustment reason logged for audit trail

### 📒 Stock Ledger (The Heart of the System)
- **Every stock movement ever made** is stored as an immutable ledger entry
- Stock is computed as `SUM(quantity_change)` — never stored directly
- This means stock at **any point in time** can be reconstructed
- Filter by date range, product, warehouse, or operation type
- Color-coded: 🟢 In · 🔴 Out · 🔵 Transfer · 🟡 Adjustment
- **Export to CSV** for any date range

### 🔔 Notification System
- In-app notification bell with unread badge count
- Alerts for: low stock, pending validations, large adjustments
- Stored in DB, marked read/unread per user

### 🤖 AI-Powered Restock Suggestions *(Claude API)*
- Analyzes last 30 days of ledger data
- Predicts days until stockout per product
- Suggests reorder quantity based on consumption rate
- Example: *"Steel Rods: ~8 units/day consumed. At 24 units, ~3 days left. Consider ordering 200 units."*

### 📥 CSV Import / Export
- Bulk import products via CSV upload
- Export stock ledger for any date range
- Export full product list with current stock levels

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Dashboard charts & analytics |
| **Socket.io-client** | Real-time WebSocket connection |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **React Hook Form + Zod** | Form handling & validation |
| **React Hot Toast** | Toast notifications |
| **Lucide React** | Icon system |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API server |
| **PostgreSQL** | Primary relational database |
| **Prisma ORM** | Type-safe DB access & migrations |
| **Socket.io** | Real-time bidirectional events |
| **JWT + bcrypt** | Authentication & password security |
| **Zod** | Server-side input validation |
| **Nodemailer** | OTP email delivery |
| **Helmet + CORS** | Security middleware |
| **Express Rate Limit** | Brute-force protection |
| **csv-parse / csv-stringify** | CSV import/export |

> ✅ **No Firebase. No Supabase. No MongoDB Atlas.**
> All data is managed through a locally hosted PostgreSQL database.

---

## 🗄️ Database Design

### Design Philosophy

> Stock is **never stored directly**. It is always computed as the **sum of all ledger entries** for a product at a location. This is the double-entry bookkeeping pattern used by real ERP systems like Odoo and SAP.

```sql
-- Current stock for a product at a warehouse:
SELECT SUM(quantity_change)
FROM stock_ledger
WHERE product_id = $1
  AND warehouse_id = $2
  AND deleted_at IS NULL;
```

This means:
- ✅ Full audit trail — every unit ever moved is traceable
- ✅ Point-in-time stock reconstruction for any date
- ✅ Zero data inconsistency — no direct mutations
- ✅ All stock changes wrapped in DB transactions

### Entity Relationship Overview

```
users ──────────────────────────────────────────────────────────┐
  │                                                             │
  ├── creates ──► receipts ──► receipt_lines ──► products       │
  │                                               │             │
  ├── creates ──► delivery_orders ──► delivery_lines            │
  │                                               │             │
  ├── creates ──► transfers ──► transfer_lines    │             │
  │                                               │             │
  ├── creates ──► adjustments ──► adjustment_lines│             │
  │                                               │             │
  └── all operations ──► stock_ledger ◄───────────┘             │
                              │                                  │
                         warehouses ──► locations               │
                                                                 │
                         notifications ◄────────────────────────┘
                         audit_log ◄────────────────────────────┘
```

### Schema (20 Tables)

```sql
-- USERS & AUTH
users                  (id, name, email, password_hash, role, refresh_token, created_at, updated_at, deleted_at)
otps                   (id, user_id, code, expires_at, used, created_at)

-- WAREHOUSE STRUCTURE
warehouses             (id, name, address, is_active, created_at, updated_at, deleted_at)
locations              (id, warehouse_id, name, aisle, rack, shelf, created_at)

-- PRODUCT CATALOG
product_categories     (id, name, parent_id, created_at)
units_of_measure       (id, name, abbreviation)
products               (id, name, sku, category_id, uom_id, reorder_level, description, created_at, updated_at, deleted_at)

-- SUPPLIERS & CUSTOMERS
suppliers              (id, name, email, phone, address, created_at, updated_at)
customers              (id, name, email, phone, address, created_at, updated_at)

-- OPERATIONS
receipts               (id, supplier_id, status, notes, created_by, validated_by, validated_at, created_at, updated_at)
receipt_lines          (id, receipt_id, product_id, location_id, expected_qty, received_qty)

delivery_orders        (id, customer_id, status, notes, created_by, validated_by, validated_at, created_at, updated_at)
delivery_lines         (id, delivery_id, product_id, location_id, requested_qty, delivered_qty)

transfers              (id, from_warehouse_id, to_warehouse_id, from_location_id, to_location_id, status, notes, created_by, validated_by, validated_at, created_at, updated_at)
transfer_lines         (id, transfer_id, product_id, quantity)

adjustments            (id, warehouse_id, location_id, status, reason, notes, created_by, validated_by, validated_at, created_at, updated_at)
adjustment_lines       (id, adjustment_id, product_id, recorded_qty, physical_qty, delta_qty)

-- THE HEART
stock_ledger           (id, product_id, warehouse_id, location_id, operation_type, quantity_change, reference_id, reference_type, notes, created_by, created_at)

-- SYSTEM
reorder_rules          (id, product_id, warehouse_id, min_quantity, reorder_quantity, is_active)
notifications          (id, user_id, title, message, type, is_read, reference_id, reference_type, created_at)
audit_log              (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, created_at)
```

### Key Indexes
```sql
CREATE INDEX idx_stock_ledger_product_warehouse ON stock_ledger(product_id, warehouse_id);
CREATE INDEX idx_stock_ledger_created_at ON stock_ledger(created_at);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stocksense.git
cd stocksense
```

### 2. Setup the Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Setup the Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with demo data
npm run seed
```

### 4. Setup the Frontend

```bash
cd ../client
npm install
cp .env.example .env
```

### 5. Run the App

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

App runs at: `http://localhost:5173`
API runs at: `http://localhost:5000`

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@stocksense.com | password123 |
| Staff | staff@stocksense.com | password123 |

---

## ⚙️ Environment Variables

### Server `.env`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stocksense

# Auth
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email (OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI (optional)
CLAUDE_API_KEY=your_claude_api_key
```

### Client `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
stocksense/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Base components (Button, Input, Badge, Modal)
│   │   │   ├── layout/              # Sidebar, Navbar, PageWrapper
│   │   │   └── charts/              # Dashboard chart components
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── auth/                # Login, Signup, ForgotPassword
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── products/            # Product list, create, detail
│   │   │   ├── receipts/            # Receipts list, create, detail
│   │   │   ├── deliveries/          # Delivery orders
│   │   │   ├── transfers/           # Internal transfers
│   │   │   ├── adjustments/         # Stock adjustments
│   │   │   ├── ledger/              # Stock ledger & history
│   │   │   └── settings/            # Warehouses, profile
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # Auth context, Socket context
│   │   ├── services/                # Axios API wrappers per domain
│   │   ├── utils/                   # Helpers, formatters, validators
│   │   └── lib/                     # Third-party config (axios, socket)
│   ├── index.html
│   └── vite.config.js
│
├── server/                          # Express.js Backend
│   ├── src/
│   │   ├── controllers/             # Thin — calls services, sends response
│   │   ├── services/                # Business logic lives here
│   │   ├── repositories/            # All DB queries via Prisma
│   │   ├── routes/                  # Express route definitions
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── rbac.js              # Role-based access control
│   │   │   └── validate.js          # Zod schema validation
│   │   ├── sockets/                 # Socket.io event handlers
│   │   ├── utils/                   # Mailer, CSV parser, helpers
│   │   └── app.js                   # Express app setup
│   └── server.js                    # Entry point
│
├── prisma/
│   ├── schema.prisma                # Full database schema
│   ├── migrations/                  # Migration history
│   └── seed.js                      # Demo data seeder
│
└── README.md
```

---

## 📡 API Reference

### Auth
```
POST   /api/auth/signup              Register new user
POST   /api/auth/login               Login, returns JWT pair
POST   /api/auth/refresh             Refresh access token
POST   /api/auth/forgot-password     Send OTP to email
POST   /api/auth/verify-otp          Verify OTP code
POST   /api/auth/reset-password      Reset password with verified OTP
POST   /api/auth/logout              Invalidate refresh token
```

### Products
```
GET    /api/products                 List all products (paginated, filterable)
POST   /api/products                 Create product
GET    /api/products/:id             Get product + stock per location
PUT    /api/products/:id             Update product
DELETE /api/products/:id             Soft delete product
GET    /api/products/:id/ledger      Product movement history
POST   /api/products/import          Bulk import via CSV
GET    /api/products/export          Export as CSV
```

### Receipts
```
GET    /api/receipts                 List receipts (paginated, filterable)
POST   /api/receipts                 Create draft receipt
GET    /api/receipts/:id             Get receipt with line items
PUT    /api/receipts/:id             Update draft receipt
POST   /api/receipts/:id/validate    Validate → stock increases
POST   /api/receipts/:id/cancel      Cancel receipt
```

### Delivery Orders
```
GET    /api/deliveries               List delivery orders
POST   /api/deliveries               Create draft delivery
GET    /api/deliveries/:id           Get delivery with line items
PUT    /api/deliveries/:id           Update draft delivery
POST   /api/deliveries/:id/validate  Validate → stock decreases
POST   /api/deliveries/:id/cancel    Cancel delivery
```

### Transfers, Adjustments, Ledger
```
GET    /api/transfers                List transfers
POST   /api/transfers                Create transfer
POST   /api/transfers/:id/validate   Validate transfer

GET    /api/adjustments              List adjustments
POST   /api/adjustments              Create adjustment
POST   /api/adjustments/:id/validate Validate adjustment → stock corrected

GET    /api/ledger                   Full ledger (filterable by date, product, warehouse)
GET    /api/ledger/export            Export ledger as CSV
```

### Dashboard & Notifications
```
GET    /api/dashboard/kpis           Live KPI totals
GET    /api/dashboard/chart          Movement chart data (last 7/30 days)
GET    /api/dashboard/low-stock      Low stock products list
GET    /api/dashboard/activity       Recent activity feed

GET    /api/notifications            User notifications (paginated)
PATCH  /api/notifications/:id/read   Mark as read
PATCH  /api/notifications/read-all   Mark all as read
```

---

## ⚡ Real-Time Events (Socket.io)

| Event | Direction | Payload |
|-------|-----------|---------|
| `stock:updated` | Server → Client | `{ productId, warehouseId, newTotal }` |
| `kpi:updated` | Server → Client | `{ totalStock, lowStock, pendingReceipts, ... }` |
| `activity:new` | Server → Client | `{ user, action, reference, timestamp }` |
| `notification:new` | Server → Client | `{ title, message, type }` |

When a manager validates a receipt → all connected clients instantly see updated KPIs and a new activity feed entry — no refresh needed.

---

## 🔒 Security Measures

| Threat | Mitigation |
|--------|-----------|
| Weak passwords | bcrypt with salt rounds = 12 |
| Token theft | Short-lived access tokens (15min) + refresh rotation |
| Brute force | Rate limiting: 5 attempts / 15 min on auth routes |
| SQL injection | Prisma ORM with parameterized queries |
| XSS | Helmet.js CSP headers + input sanitization |
| CSRF | CORS whitelist + SameSite cookie policy |
| Unauthorized access | JWT middleware + RBAC on every protected route |
| Data loss | Soft deletes + full audit log |

---

## ✅ Input Validation

Every API endpoint validates its input with **Zod schemas** before any business logic runs:

- Invalid email → `"Please enter a valid email address"`
- Negative quantity → `"Quantity must be greater than 0"`
- Duplicate SKU → `"A product with this SKU already exists"`
- Missing required fields → field-level inline error messages in UI
- Validating an already-done receipt → `"This receipt has already been validated"`
- Delivering more than available stock → `"Insufficient stock at selected location"`

---

## 🔄 Inventory Flow

```
┌─────────────────────────────────────────────────────────┐
│                    STOCK LEDGER                         │
│                                                         │
│  Step 1: Receive 100kg Steel from Vendor                │
│          └─► Ledger Entry: +100 | Main Warehouse        │
│                                                         │
│  Step 2: Transfer to Production Rack                    │
│          └─► Ledger Entry: -100 (Main) +100 (Production)│
│                                                         │
│  Step 3: Deliver 20 steel to customer                   │
│          └─► Ledger Entry: -20 | Production Rack        │
│                                                         │
│  Step 4: Adjust 3kg damaged steel                       │
│          └─► Ledger Entry: -3 | Production Rack         │
│                                                         │
│  Current Stock = SUM of all ledger entries = 77kg       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Design System

- **Base color:** `#0F172A` (dark navy)
- **Accent:** `#3B82F6` (blue)
- **Font:** Inter (Google Fonts)
- **Spacing:** 8px grid system
- **Layout:** Dark sidebar + light content area
- **Components:** Cards, data tables, status badges, step indicators, side drawers, modals, toast notifications
- **Charts:** Recharts — line chart (movement), bar chart (top products), progress bars (stock levels)

---

## 🗺️ Mockup

Visual design reference: [Excalidraw Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R)

---

## 👥 Team

| Name | Role |
|------|------|
| Member 1 | Backend & Database Architecture |
| Member 2 | Frontend & UI/UX |
| Member 3 | API Design & Real-Time Features |
| Member 4 | Auth, Security & Testing |

---

## 📄 License

Built for a hackathon. © 2026 StockSense Team. All rights reserved.
