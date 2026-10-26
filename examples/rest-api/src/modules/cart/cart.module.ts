import { RouteGroup } from 'voltts';
import { authenticate } from '../../common/guards/auth.guard';
import { cartController } from './cart.controller';
import { addToCartSchema, cartParamSchema, updateCartItemSchema } from './cart.schema';

export class CartModule {
  static register(group: RouteGroup): void {
    // All cart operations require authentication
    group.use(authenticate);

    // GET /api/v1/cart
    group.get('/', (c) => cartController.getCart(c), {
      summary: "Get current user's shopping cart",
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
    });

    // POST /api/v1/cart/items
    group.post(
      '/items',
      (c) => cartController.addItem(c),
      {
        summary: 'Add an item to the shopping cart',
        tags: ['Cart'],
        body: addToCartSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // PUT /api/v1/cart/items/:productId
    group.put(
      '/items/:productId',
      (c) => cartController.updateItem(c),
      {
        summary: 'Update item quantity in cart',
        tags: ['Cart'],
        params: cartParamSchema,
        body: updateCartItemSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // DELETE /api/v1/cart/items/:productId
    group.delete(
      '/items/:productId',
      (c) => cartController.removeItem(c),
      {
        summary: 'Remove an item from cart',
        tags: ['Cart'],
        params: cartParamSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // DELETE /api/v1/cart
    group.delete('/', (c) => cartController.clearCart(c), {
      summary: 'Clear all items from shopping cart',
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
    });
  }
}
