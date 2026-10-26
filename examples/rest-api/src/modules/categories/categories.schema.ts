import { t } from 'voltts';

export const categoryParamSchema = t.Object({
  id: t.String({ description: 'Category identifier or slug' }),
});

export const createCategorySchema = t.Object({
  name: t.String({ minLength: 2, maxLength: 50, description: 'Category title' }),
  slug: t.Optional(t.String({ minLength: 2, maxLength: 60, description: 'URL-friendly slug' })),
  description: t.Optional(t.String({ maxLength: 300, description: 'Category description' })),
});
