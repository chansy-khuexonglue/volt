import { Context, RouteGroup } from 'volt';
import { cartService } from './cart.service';

function getSessionId(req: Request): string {
  return (
    req.headers.get('x-session-id') ||
    req.headers.get('x-cart-id') ||
    'anonymous-session'
  );
}

export class CartModule {
  static register(router: RouteGroup): void {
    // Get current cart
    router.get('/', (ctx: Context) => {
      const sessionId = getSessionId(ctx.req);
      const cart = cartService.getCart(sessionId);
      return ctx.json({ success: true, data: cart });
    });

    // Add item to cart
    router.post('/items', async (ctx: Context) => {
      try {
        const sessionId = getSessionId(ctx.req);
        const body: any = (ctx.body && typeof ctx.body === 'object' && Object.keys(ctx.body).length > 0)
          ? ctx.body
          : (await ctx.req.json().catch(() => ({}))) || {};
        const productId = body.productId || body.product_id;
        const quantity = Number(body.quantity) || 1;

        if (!productId) {
          return ctx.json({ success: false, error: 'Product ID is required' }, 400);
        }

        const cart = await cartService.addItem(sessionId, productId, quantity);
        return ctx.json({ success: true, data: cart });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 400);
      }
    });

    // Update item quantity
    router.put('/items/:id', async (ctx: Context) => {
      try {
        const sessionId = getSessionId(ctx.req);
        const productId = ctx.params.id;
        const body: any = (ctx.body && typeof ctx.body === 'object' && Object.keys(ctx.body).length > 0)
          ? ctx.body
          : (await ctx.req.json().catch(() => ({}))) || {};
        const quantity = Number(body.quantity);

        if (isNaN(quantity)) {
          return ctx.json({ success: false, error: 'Valid quantity is required' }, 400);
        }

        const cart = cartService.updateItem(sessionId, productId, quantity);
        return ctx.json({ success: true, data: cart });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 400);
      }
    });

    // Remove single item
    router.delete('/items/:id', (ctx: Context) => {
      const sessionId = getSessionId(ctx.req);
      const productId = ctx.params.id;
      const cart = cartService.removeItem(sessionId, productId);
      return ctx.json({ success: true, data: cart });
    });

    // Clear entire cart
    router.delete('/', (ctx: Context) => {
      const sessionId = getSessionId(ctx.req);
      const cart = cartService.clearCart(sessionId);
      return ctx.json({ success: true, data: cart });
    });
  }
}
