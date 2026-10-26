import { t } from 'voltts';

export const productParamSchema = t.Object({
  id: t.String({ description: 'Unique product identifier' }),
});

export const productQuerySchema = t.Object({
  category: t.Optional(t.String({ description: 'Filter by category name' })),
  minPrice: t.Optional(t.Number({ min: 0, description: 'Minimum price threshold' })),
  maxPrice: t.Optional(t.Number({ min: 0, description: 'Maximum price threshold' })),
  limit: t.Optional(t.Integer({ min: 1, max: 100, default: 20 })),
});

export const createProductSchema = t.Object({
  name: t.String({ minLength: 2, maxLength: 100, description: 'Product title' }),
  description: t.Optional(t.String({ maxLength: 500 })),
  price: t.Number({ min: 0.01, description: 'Unit price' }),
  stock: t.Integer({ min: 0, description: 'Available stock count' }),
  category: t.String({ minLength: 2, maxLength: 50, description: 'Category' }),
});

export const updateProductSchema = t.Object({
  name: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
  description: t.Optional(t.String({ maxLength: 500 })),
  price: t.Optional(t.Number({ min: 0.01 })),
  stock: t.Optional(t.Integer({ min: 0 })),
  category: t.Optional(t.String({ minLength: 2, maxLength: 50 })),
});
