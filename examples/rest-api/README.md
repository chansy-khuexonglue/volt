# 🛒 Volt Enterprise eCommerce REST API

A production-grade, full-lifecycle eCommerce REST API built natively on **Bun** with the **Volt** framework using **NestJS-style modular architecture**.

---

## 📁 Architecture & Domain-Driven Structure

```text
examples/rest-api/src/
├── common/                         # Shared cross-cutting infrastructure
│   ├── guards/
│   │   └── auth.guard.ts           # JWT authentication & requireRole('admin') RBAC
│   ├── jobs/
│   │   └── ecommerce-jobs.ts       # Asynchronous order confirmation JobQueue worker
│   └── types/
│       └── common.types.ts         # Shared pagination & API response contracts
│
├── config/
│   └── env.ts                      # Strongly typed environment configuration
│
├── modules/
│   ├── health/                     # Health checks & system diagnostics
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   │
│   ├── auth/                       # User accounts, JWT issuance & verification
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts
│   │   ├── auth.types.ts
│   │   └── auth.module.ts
│   │
│   ├── categories/                 # Product taxonomy & classification
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── categories.schema.ts
│   │   ├── categories.types.ts
│   │   └── categories.module.ts
│   │
│   ├── products/                   # Catalog inventory, pricing & filters
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.schema.ts
│   │   ├── products.types.ts
│   │   └── products.module.ts
│   │
│   ├── reviews/                    # Product reviews, star ratings & summaries
│   │   ├── reviews.controller.ts
│   │   ├── reviews.service.ts
│   │   ├── reviews.schema.ts
│   │   ├── reviews.types.ts
│   │   └── reviews.module.ts
│   │
│   ├── cart/                       # Persistent shopping cart & stock checks
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   ├── cart.schema.ts
│   │   ├── cart.types.ts
│   │   └── cart.module.ts
│   │
│   ├── orders/                     # Checkout, tax, shipping, and order tracking
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.schema.ts
│   │   ├── orders.types.ts
│   │   └── orders.module.ts
│   │
│   └── payments/                   # Payment processing & receipt generation
│       ├── payments.controller.ts
│       ├── payments.service.ts
│       ├── payments.schema.ts
│       ├── payments.types.ts
│       └── payments.module.ts
│
├── app.module.ts                   # Central composer registering all modules & middleware
├── app.ts                          # Bootstrap factory creating Volt app instance
└── index.ts                        # Process entry point, banner & graceful shutdown
```

---

## 🛒 Complete eCommerce API Matrix

| Module | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/` | Public | System status & interactive doc links |
| **System** | `GET` | `/health` | Public | Memory RSS, uptime & diagnostic health |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Create customer or admin account |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate & receive Bearer JWT |
| **Auth** | `GET` | `/api/v1/auth/me` | Bearer JWT | Retrieve authenticated user profile |
| **Categories** | `GET` | `/api/v1/categories` | Public | List all categories with product counts |
| **Categories** | `GET` | `/api/v1/categories/:id` | Public | Lookup category by ID or slug |
| **Categories** | `POST` | `/api/v1/categories` | Admin Only | Create new product category |
| **Products** | `GET` | `/api/v1/products` | Public | Filter products by category, price & limit |
| **Products** | `GET` | `/api/v1/products/:id` | Public | Retrieve single product details |
| **Products** | `POST` | `/api/v1/products` | Admin Only | Create new catalog product |
| **Products** | `PUT` | `/api/v1/products/:id` | Admin Only | Update product price, stock & description |
| **Products** | `DELETE`| `/api/v1/products/:id` | Admin Only | Remove product from catalog |
| **Reviews** | `GET` | `/api/v1/products/:id/reviews` | Public | List reviews & average rating score |
| **Reviews** | `POST` | `/api/v1/products/:id/reviews` | Bearer JWT | Submit customer review (1-5 stars) |
| **Cart** | `GET` | `/api/v1/cart` | Bearer JWT | Get active customer shopping cart |
| **Cart** | `POST` | `/api/v1/cart/items` | Bearer JWT | Add item to cart with quantity check |
| **Cart** | `PUT` | `/api/v1/cart/items/:productId` | Bearer JWT | Update quantity of item in cart |
| **Cart** | `DELETE`| `/api/v1/cart/items/:productId` | Bearer JWT | Remove item from cart |
| **Cart** | `DELETE`| `/api/v1/cart` | Bearer JWT | Clear entire shopping cart |
| **Orders** | `POST` | `/api/v1/orders/checkout` | Bearer JWT | Checkout cart, deduct stock, create order |
| **Orders** | `GET` | `/api/v1/orders` | Bearer JWT | List order history (or all orders if admin) |
| **Orders** | `GET` | `/api/v1/orders/:id` | Bearer JWT | View order receipt & tracking |
| **Orders** | `POST` | `/api/v1/orders/:id/cancel` | Bearer JWT | Cancel order and restore product stock |
| **Orders** | `PATCH`| `/api/v1/orders/:id/status` | Admin Only | Update fulfillment status (`shipped`, etc.) |
| **Payments** | `POST` | `/api/v1/payments` | Bearer JWT | Pay for pending order & transition to paid |
| **Payments** | `GET` | `/api/v1/payments/:id` | Bearer JWT | Retrieve transaction payment receipt |

---

## 🚀 Running the Project

```bash
# Run with Bun in watch mode (auto-reload on save)
bun run dev:rest

# Or from examples/rest-api directory
cd examples/rest-api && bun run dev
```

---

## 🧪 Testing

```bash
# Run full eCommerce test suite
bun test examples/rest-api/test

# Run full monorepo test suite (115 tests)
bun test

# Typecheck
bun run typecheck
```

---

## 📖 Interactive Documentation

| Documentation | URL |
|---|---|
| **Swagger UI** | [http://localhost:3000/swagger](http://localhost:3000/swagger) |
| **Scalar Reference** | [http://localhost:3000/docs](http://localhost:3000/docs) |
| **OpenAPI 3.0.3 JSON** | [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json) |

---

## 🔒 Preconfigured Test Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@volt.sh` | `admin123` | Full access (create categories/products, update orders, manage catalog) |
| **Customer** | `demo@volt.sh` | `demo123` | Full customer lifecycle (cart, checkout, payment, review) |
