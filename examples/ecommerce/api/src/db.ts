import { PrismaClient } from '@prisma/client';
import { config } from './config';

// Official Prisma ORM Client initialized using DATABASE_URL from .env
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});

// High-performance Bun native SQL driver for benchmark and raw queries
export const sql = new Bun.SQL(config.databaseUrl);

export type {
  Category,
  Product,
  Review,
  Order,
  User,
} from '@prisma/client';

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
