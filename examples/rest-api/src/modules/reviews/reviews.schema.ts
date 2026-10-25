import { t } from 'volt';

export const reviewParamSchema = t.Object({
  id: t.String({ description: 'Product identifier' }),
});

export const createReviewSchema = t.Object({
  rating: t.Integer({ min: 1, max: 5, description: 'Rating score from 1 to 5 stars' }),
  comment: t.String({ minLength: 3, maxLength: 500, description: 'Customer review comment' }),
});
