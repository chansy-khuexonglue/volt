import { sql, Category, Product } from '../../db';

export class CategoriesService {
  async getAll(): Promise<Category[]> {
    const rows = await sql`
      SELECT id, name, slug, description, image_url, item_count, created_at
      FROM categories
      ORDER BY name ASC
    `;
    return rows as unknown as Category[];
  }

  async getBySlug(slug: string): Promise<{ category: Category; products: Product[] } | null> {
    const rows = await sql`
      SELECT id, name, slug, description, image_url, item_count, created_at
      FROM categories
      WHERE slug = ${slug} OR id = ${slug}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;

    const category = rows[0] as unknown as Category;

    const products = await sql`
      SELECT id, title, slug, description, price, compare_at_price, category_id,
             category_name, stock, rating, review_count, badge, is_featured, images, specs, created_at
      FROM products
      WHERE category_id = ${category.id}
      ORDER BY created_at DESC
    `;

    return {
      category,
      products: products as unknown as Product[],
    };
  }
}

export const categoriesService = new CategoriesService();
