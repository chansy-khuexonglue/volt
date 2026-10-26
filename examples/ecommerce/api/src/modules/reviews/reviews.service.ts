import { prisma, Review } from '../../db';

export interface CreateReviewInput {
  userName: string;
  rating: number;
  title: string;
  comment: string;
}

export class ReviewsService {
  async getByProductId(productId: string): Promise<Review[]> {
    return prisma.review.findMany({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(productId: string, input: CreateReviewInput): Promise<Review> {
    const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const rating = Math.max(1, Math.min(5, Math.round(input.rating || 5)));
    const userName = input.userName?.trim() || 'Verified Buyer';
    const title = input.title?.trim() || 'Great Product';
    const comment = input.comment?.trim() || '';

    // Insert review
    const review = await prisma.review.create({
      data: {
        id,
        product_id: productId,
        user_name: userName,
        rating,
        title,
        comment,
      },
    });

    // Recalculate average rating & review count for product using Prisma aggregations
    const aggregations = await prisma.review.aggregate({
      where: { product_id: productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    const avg = aggregations._avg.rating ? Number(aggregations._avg.rating.toFixed(2)) : rating;
    const count = aggregations._count.id || 1;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avg,
        review_count: count,
        updated_at: new Date(),
      },
    });

    return review;
  }
}

export const reviewsService = new ReviewsService();
