# 🛒 Volt eCommerce REST API

High-performance, modular eCommerce REST API built with **Volt**, **Bun**, and **PostgreSQL**.

---

## ⚡ Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Live health check & DB connection status |
| `GET` | `/docs` | Interactive Scalar API reference documentation |
| `GET` | `/swagger` | Interactive Swagger UI API documentation |
| `GET` | `/openapi.json` | OpenAPI 3.1 schema specification |
| `GET` | `/api/categories` | List all product categories |
| `GET` | `/api/categories/:slug` | Get category details and associated products |
| `GET` | `/api/products` | Query products catalog with filters & search |
| `GET` | `/api/products/featured`| Get curated featured products |
| `GET` | `/api/products/:id` | Get product details with specs |
| `GET` | `/api/products/:id/reviews` | List verified customer reviews |
| `POST` | `/api/products/:id/reviews` | Submit new customer review & update rating |
| `GET` | `/api/cart` | Get current cart items & calculated totals |
| `POST` | `/api/cart/items` | Add product to cart |
| `PUT` | `/api/cart/items/:id` | Update product quantity |
| `DELETE` | `/api/cart/items/:id` | Remove product from cart |
| `DELETE` | `/api/cart` | Clear entire cart |
| `POST` | `/api/orders/checkout` | Process checkout and record order in PostgreSQL |
| `GET` | `/api/orders/:id` | Get order details by ID or order number |
| `GET` | `/api/orders` | List recent orders |
| `POST` | `/api/auth/register` | Register customer account |
| `POST` | `/api/auth/login` | Authenticate customer account |
| `GET` | `/api/auth/me` | Get authenticated user profile |

---

## 🚀 Running the API

```bash
# In repository root
bun run dev:ecommerce:api

# Or directly in this directory
bun run dev
```

Server listens on **`http://localhost:3000`**.
Scalar Docs: **`http://localhost:3000/docs`**.
Swagger UI: **`http://localhost:3000/swagger`**.
