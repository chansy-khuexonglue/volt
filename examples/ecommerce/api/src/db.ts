import { config } from './config';

// Initialize Bun's native high-performance SQL driver using DATABASE_URL from .env
export const sql = new Bun.SQL(config.databaseUrl);

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  item_count: number;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  category_name: string;
  stock: number;
  rating: number;
  review_count: number;
  badge?: string | null;
  is_featured: boolean;
  images: string[];
  specs?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  user_id?: string | null;
  status: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at?: string;
}

/**
 * High-performance Prisma Client adapter for Volt's @volt/plugin-prisma.
 * Bridges Prisma ORM delegate signatures directly to native PostgreSQL storage.
 */
export class EcommercePrismaClient {
  private connected = false;

  async $connect(): Promise<void> {
    try {
      const res = await sql`SELECT 1 as healthy`;
      this.connected = Array.isArray(res) && res.length > 0;
    } catch (err) {
      this.connected = false;
      throw err;
    }
  }

  async $disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async $queryRaw<T = any>(query: any, ...params: any[]): Promise<T> {
    return (await sql(query, ...params)) as unknown as T;
  }

  async $executeRaw<T = any>(query: any, ...params: any[]): Promise<T> {
    return (await sql(query, ...params)) as unknown as T;
  }

  category = {
    findMany: async () => {
      const rows = await sql`
        SELECT id, name, slug, description, image_url, item_count, created_at
        FROM categories
        ORDER BY name ASC
      `;
      return rows as unknown as Category[];
    },
    findUnique: async (args: { where: { slug?: string; id?: string } }) => {
      if (args.where.slug) {
        const rows = await sql`SELECT * FROM categories WHERE slug = ${args.where.slug} LIMIT 1`;
        return (rows[0] as unknown as Category) || null;
      }
      if (args.where.id) {
        const rows = await sql`SELECT * FROM categories WHERE id = ${args.where.id} LIMIT 1`;
        return (rows[0] as unknown as Category) || null;
      }
      return null;
    },
  };

  product = {
    findMany: async (args?: { where?: { category_id?: string; is_featured?: boolean }; take?: number; skip?: number }) => {
      if (args?.where?.category_id) {
        const rows = await sql`SELECT * FROM products WHERE category_id = ${args.where.category_id} ORDER BY created_at DESC`;
        return rows as unknown as Product[];
      }
      if (args?.where?.is_featured) {
        const rows = await sql`SELECT * FROM products WHERE is_featured = true ORDER BY rating DESC`;
        return rows as unknown as Product[];
      }
      const limit = args?.take || 50;
      const offset = args?.skip || 0;
      const rows = await sql`SELECT * FROM products ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      return rows as unknown as Product[];
    },
    findUnique: async (args: { where: { id?: string; slug?: string } }) => {
      if (args.where.id) {
        const rows = await sql`SELECT * FROM products WHERE id = ${args.where.id} LIMIT 1`;
        return (rows[0] as unknown as Product) || null;
      }
      if (args.where.slug) {
        const rows = await sql`SELECT * FROM products WHERE slug = ${args.where.slug} LIMIT 1`;
        return (rows[0] as unknown as Product) || null;
      }
      return null;
    },
  };

  review = {
    findMany: async (args: { where: { product_id: string } }) => {
      const rows = await sql`
        SELECT * FROM reviews
        WHERE product_id = ${args.where.product_id}
        ORDER BY created_at DESC
      `;
      return rows as unknown as Review[];
    },
    create: async (args: { data: { product_id: string; user_name: string; rating: number; title: string; comment: string } }) => {
      const rows = await sql`
        INSERT INTO reviews (product_id, user_name, rating, title, comment)
        VALUES (${args.data.product_id}, ${args.data.user_name}, ${args.data.rating}, ${args.data.title}, ${args.data.comment})
        RETURNING *
      `;
      return rows[0] as unknown as Review;
    },
  };

  order = {
    findMany: async () => {
      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return rows as unknown as Order[];
    },
    findUnique: async (args: { where: { order_number?: string; id?: string } }) => {
      if (args.where.order_number) {
        const rows = await sql`SELECT * FROM orders WHERE order_number = ${args.where.order_number} LIMIT 1`;
        return (rows[0] as unknown as Order) || null;
      }
      if (args.where.id) {
        const rows = await sql`SELECT * FROM orders WHERE id = ${args.where.id} LIMIT 1`;
        return (rows[0] as unknown as Order) || null;
      }
      return null;
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const rows = await sql`
        INSERT INTO orders (
          order_number, customer_name, customer_email, total_amount,
          subtotal, shipping_fee, items, shipping_address, payment_method
        )
        VALUES (
          ${d.order_number}, ${d.customer_name}, ${d.customer_email}, ${d.total_amount},
          ${d.subtotal}, ${d.shipping_fee}, ${JSON.stringify(d.items)},
          ${JSON.stringify(d.shipping_address)}, ${d.payment_method}
        )
        RETURNING *
      `;
      return rows[0] as unknown as Order;
    },
  };

  user = {
    findUnique: async (args: { where: { email?: string; id?: string } }) => {
      if (args.where.email) {
        const rows = await sql`SELECT * FROM users WHERE email = ${args.where.email.toLowerCase()} LIMIT 1`;
        return (rows[0] as unknown as User) || null;
      }
      if (args.where.id) {
        const rows = await sql`SELECT * FROM users WHERE id = ${args.where.id} LIMIT 1`;
        return (rows[0] as unknown as User) || null;
      }
      return null;
    },
    create: async (args: { data: { name: string; email: string; password_hash: string; role?: string } }) => {
      const rows = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${args.data.name}, ${args.data.email.toLowerCase()}, ${args.data.password_hash}, ${args.data.role || 'customer'})
        RETURNING *
      `;
      return rows[0] as unknown as User;
    },
  };
}

export const prisma = new EcommercePrismaClient();
