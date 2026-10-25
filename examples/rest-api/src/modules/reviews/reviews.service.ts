import { productsService } from '../products/products.service';
import { CreateReviewDto, ProductReviewsSummary, Review } from './reviews.types';

export class ReviewsService {
  private reviews: Review[] = [
    {
      id: 'rev_1',
      productId: 'prod_1',
      userId: 'usr_admin',
      userName: 'Admin User',
      rating: 5,
      comment: 'Top-tier build quality, stellar sound with lubed switches.',
      createdAt: '2026-02-01T12:00:00.000Z',
    },
    {
      id: 'rev_2',
      productId: 'prod_1',
      userId: 'usr_customer_2',
      userName: 'Satisfied Customer',
      rating: 4,
      comment: 'Great custom keyboard, heavy and feels premium on the desk.',
      createdAt: '2026-02-15T16:30:00.000Z',
    },
  ];

  findByProduct(productId: string): ProductReviewsSummary {
    const matching = this.reviews.filter((r) => r.productId === productId);
    const avg = matching.length
      ? Number((matching.reduce((acc, r) => acc + r.rating, 0) / matching.length).toFixed(1))
      : 0;

    return {
      productId,
      averageRating: avg,
      reviewCount: matching.length,
      reviews: matching,
    };
  }

  create(
    productId: string,
    userId: string,
    userName: string,
    dto: CreateReviewDto
  ): Review {
    const product = productsService.findById(productId);
    if (!product) {
      throw new Error(`Product "${productId}" not found`);
    }

    const alreadyReviewed = this.reviews.some(
      (r) => r.productId === productId && r.userId === userId
    );
    if (alreadyReviewed) {
      throw new Error('You have already submitted a review for this product');
    }

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userId,
      userName,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
    };

    this.reviews.push(newReview);
    return newReview;
  }
}

export const reviewsService = new ReviewsService();
