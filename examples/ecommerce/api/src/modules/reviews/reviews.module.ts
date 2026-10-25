import { Context, RouteGroup } from 'volt';
import { reviewsService } from './reviews.service';

export class ReviewsModule {
  static register(router: RouteGroup): void {
    // List reviews for a product
    router.get('/:id/reviews', async (ctx: Context) => {
      try {
        const productId = ctx.params.id;
        const reviews = await reviewsService.getByProductId(productId);
        return ctx.json({
          success: true,
          data: reviews,
          count: reviews.length,
        });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });

    // Create a new review
    router.post('/:id/reviews', async (ctx: Context) => {
      try {
        const productId = ctx.params.id;
        const body: any = (ctx.body && typeof ctx.body === 'object' && Object.keys(ctx.body).length > 0)
          ? ctx.body
          : (await ctx.req.json().catch(() => ({}))) || {};
        const review = await reviewsService.create(productId, {
          userName: body.userName || body.user_name || 'Anonymous',
          rating: Number(body.rating) || 5,
          title: body.title || '',
          comment: body.comment || '',
        });
        return ctx.json({
          success: true,
          data: review,
        }, 201);
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });
  }
}
