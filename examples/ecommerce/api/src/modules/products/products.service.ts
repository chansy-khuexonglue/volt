import { sql, Product } from '../../db';

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

export class ProductsService {
  async getAll(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = filters?.offset || 0;

    // Use Bun.SQL tagged template queries
    let rows: any[];
    if (filters?.category) {
      rows = await sql`
        SELECT id, title, slug, description, price, compare_at_price, category_id,
               category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
        FROM products
        WHERE category_id = ${filters.category} OR category_name ILIKE ${'%' + filters.category + '%'}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filters?.search) {
      const q = `%${filters.search}%`;
      rows = await sql`
        SELECT id, title, slug, description, price, compare_at_price, category_id,
               category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
        FROM products
        WHERE title ILIKE ${q} OR description ILIKE ${q} OR category_name ILIKE ${q}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filters?.sort === 'price_asc') {
      rows = await sql`
        SELECT id, title, slug, description, price, compare_at_price, category_id,
               category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
        FROM products
        ORDER BY price ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filters?.sort === 'price_desc') {
      rows = await sql`
        SELECT id, title, slug, description, price, compare_at_price, category_id,
               category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
        FROM products
        ORDER BY price DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filters?.sort === 'rating') {
      rows = await sql`
        SELECT id, title, slug, description, price, compare_at_price, category_id,
               category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
        FROM products
        ORDER BY rating DESC, review_count DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT id, title, slug, description, price, compare_at_price, category_id,
               category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
        FROM products
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countRes = await sql`SELECT count(*)::int as count FROM products`;
    const total = countRes[0]?.count || rows.length;

    return {
      products: rows as Product[],
      total,
    };
  }

  async getFeatured(): Promise<Product[]> {
    const rows = await sql`
      SELECT id, title, slug, description, price, compare_at_price, category_id,
             category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
      FROM products
      WHERE is_featured = true
      ORDER BY rating DESC
      LIMIT 6
    `;
    return rows as unknown as Product[];
  }

  async getById(idOrSlug: string): Promise<Product | null> {
    const rows = await sql`
      SELECT id, title, slug, description, price, compare_at_price, category_id,
             category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
      FROM products
      WHERE id = ${idOrSlug} OR slug = ${idOrSlug}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    return rows[0] as unknown as Product;
  }
}

export const productsService = new ProductsService();
