import { sql } from '../db';

async function seed() {
  console.log('Seeding PostgreSQL database...');

  // Create tables if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      item_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      compare_at_price NUMERIC(10, 2),
      category_id VARCHAR(64) NOT NULL,
      category_name VARCHAR(255) NOT NULL,
      stock INT DEFAULT 0,
      rating NUMERIC(3, 2) DEFAULT 5.0,
      review_count INT DEFAULT 0,
      badge VARCHAR(64),
      is_featured BOOLEAN DEFAULT false,
      images TEXT[] NOT NULL,
      specs JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(255),
      comment TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      order_number VARCHAR(64) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      user_id VARCHAR(64),
      status VARCHAR(64) DEFAULT 'confirmed',
      total_amount NUMERIC(10, 2) NOT NULL,
      subtotal NUMERIC(10, 2) NOT NULL,
      shipping_fee NUMERIC(10, 2) NOT NULL,
      items JSONB NOT NULL,
      shipping_address JSONB NOT NULL,
      payment_method VARCHAR(64) DEFAULT 'credit_card',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('Database initialized successfully.');
}

seed().catch(console.error);
