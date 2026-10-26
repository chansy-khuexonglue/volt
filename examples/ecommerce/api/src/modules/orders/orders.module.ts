import { Context, RouteGroup } from 'voltts';
import { ordersService, CheckoutPayload } from './orders.service';

export class OrdersModule {
  static register(router: RouteGroup): void {
    // List recent orders
    router.get('/', async (ctx: Context) => {
      try {
        const orders = await ordersService.getAll();
        return ctx.json({ success: true, data: orders, count: orders.length });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });

    // Create / Checkout order
    router.post('/checkout', async (ctx: Context) => {
      try {
        const body: any = (ctx.body && typeof ctx.body === 'object' && Object.keys(ctx.body).length > 0)
          ? ctx.body
          : (await ctx.req.json().catch(() => ({}))) || {};
        const payload: CheckoutPayload = {
          customerName: body.customerName || body.customer_name || 'Customer',
          customerEmail: body.customerEmail || body.customer_email || 'customer@example.com',
          userId: body.userId || body.user_id || null,
          items: body.items || [],
          shippingAddress: body.shippingAddress || body.shipping_address || {
            full_name: body.customerName || 'Customer',
            email: body.customerEmail || 'customer@example.com',
            address: '123 Market St',
            city: 'San Francisco',
            postal_code: '94103',
            country: 'United States',
          },
          paymentMethod: body.paymentMethod || body.payment_method || 'credit_card',
        };

        const order = await ordersService.checkout(payload);
        return ctx.json({ success: true, data: order }, 201);
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 400);
      }
    });

    // Get order by ID or order_number
    router.get('/:id', async (ctx: Context) => {
      try {
        const id = ctx.params.id;
        const order = await ordersService.getById(id);
        if (!order) {
          return ctx.json({ success: false, error: 'Order not found' }, 404);
        }
        return ctx.json({ success: true, data: order });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });
  }
}
