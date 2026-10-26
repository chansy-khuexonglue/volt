import { RouteGroup } from 'voltts';
import { authenticate } from '../../common/guards/auth.guard';
import { reviewsController } from './reviews.controller';
import { createReviewSchema, reviewParamSchema } from './reviews.schema';

export class ReviewsModule {
  static register(group: RouteGroup): void {
    // GET /api/v1/products/:id/reviews (Public)
    group.get(
      '/:id/reviews',
      (c) => reviewsController.findByProduct(c),
      {
        summary: 'List reviews and average rating for a product',
        tags: ['Reviews'],
        params: reviewParamSchema,
      }
    );

    // POST /api/v1/products/:id/reviews (Authenticated)
    group.post(
      '/:id/reviews',
      (c) => reviewsController.create(c),
      {
        summary: 'Submit a customer review and rating for a product',
        tags: ['Reviews'],
        params: reviewParamSchema,
        body: createReviewSchema,
        security: [{ bearerAuth: [] }],
      },
      [authenticate]
    );
  }
}
