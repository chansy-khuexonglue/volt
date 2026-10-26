import { Context } from 'voltts';
import { reviewsService } from './reviews.service';
import { CreateReviewDto } from './reviews.types';

export class ReviewsController {
  findByProduct(c: Context<{ id: string }>) {
    const summary = reviewsService.findByProduct(c.params.id);
    return c.json(summary, 200);
  }

  create(c: Context<{ id: string }, CreateReviewDto>) {
    try {
      const user = c.store.user;
      const review = reviewsService.create(
        c.params.id,
        user.sub,
        user.name,
        c.body
      );
      return c.json(review, 201);
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      return c.json({ error: status === 404 ? 'NotFound' : 'BadRequest', message: err.message }, status);
    }
  }
}

export const reviewsController = new ReviewsController();
