import { t } from 'voltts';

export const cartParamSchema = t.Object({
  productId: t.String({ description: 'Product identifier' }),
});

export const addToCartSchema = t.Object({
  productId: t.String({ description: 'ID of product to add' }),
  quantity: t.Integer({ min: 1, max: 50, default: 1, description: 'Quantity to purchase' }),
});

export const updateCartItemSchema = t.Object({
  quantity: t.Integer({ min: 1, max: 50, description: 'New quantity' }),
});
