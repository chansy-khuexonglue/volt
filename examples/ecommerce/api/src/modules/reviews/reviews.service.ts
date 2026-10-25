import { sql, Review } from '../../db';

export interface CreateReviewInput {
  userName: string;
  rating: number;
  title: string;
  comment: string;
}

export class ReviewsService {
  async getByProductId(productId: string): Promise<Review[]> {
    const rows = await sql`
      SELECT id, product_id, user_name, rating, title, comment, created_at
      FROM reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;
    return rows as unknown as Review[];
  }

  async create(productId: string, input: CreateReviewInput): Promise<Review> {
    const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const rating = Math.max(1, Math.min(5, Math.round(input.rating || 5)));
    const userName = input.userName?.trim() || 'Verified Buyer';
    const title = input.title?.trim() || 'Great Product';
    const comment = input.comment?.trim() || '';

    // Insert review
    const res = await sql`
      INSERT INTO reviews (id, product_id, user_name, rating, title, comment)
      VALUES (${id}, ${productId}, ${userName}, ${rating}, ${title}, ${comment})
      RETURNING id, product_id, user_name, rating, title, comment, created_at
    `;

    // Recalculate average rating & review count for product
    const stats = await sql`
      SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*)::int as count
      FROM reviews
      WHERE product_id = ${productId}
    `;

    if (stats.length > 0) {
      const avg = stats[0].avg_rating;
      const count = stats[0].count;
      await sql`
        UPDATE products
        SET rating = ${avg}, review_count = ${count}, updated_at = NOW()
        WHERE id = ${productId}
      `;
    }

    return res[0] as unknown as Review;
  }
}

export const reviewsService = new ReviewsService();
