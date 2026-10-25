import { config } from './config';

// Initialize Bun's native high-performance SQL driver
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
