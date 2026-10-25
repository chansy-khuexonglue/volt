# ⚡ Volt eCommerce Web Storefront (Nuxt UI)

Modern, ultra-responsive storefront built with **Nuxt 4**, **@nuxt/ui**, and **Tailwind CSS v4**, connected natively to the high-performance **Volt eCommerce REST API** backed by **PostgreSQL**.

---

## 🚀 Features

- **Nuxt UI Components**: Built using `@nuxt/ui` cards, badges, buttons, drawers, and form elements.
- **Connected to Volt API**: Fast asynchronous data fetching connecting to `http://localhost:3000`.
- **Dynamic Category & Search Filters**: Instant client & server-driven catalog filtering.
- **Interactive Slideover Cart**: Real-time shopping cart with quantity controls and instant totals.
- **Product Details & Live Reviews**: Technical specifications table, high-res gallery, and verified customer review submissions saved directly to PostgreSQL.
- **End-to-End Checkout Flow**: Full checkout form creating real orders in PostgreSQL with receipts.
- **Dark & Light Mode**: Built-in color mode support with smooth transitions.

---

## 🛠️ Setup & Running

From the repository root:

```bash
# Start Volt API (port 3000)
bun run dev:ecommerce:api

# Start Web Storefront (port 3001)
bun run dev:ecommerce:web
```

Or run directly inside `examples/ecommerce/web`:

```bash
pnpm install
pnpm dev
```

Visit the storefront at **[http://localhost:3001](http://localhost:3001)**.
