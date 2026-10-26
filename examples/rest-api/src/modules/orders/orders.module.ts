import { RouteGroup } from 'voltts';
import { authenticate, requireRole } from '../../common/guards/auth.guard';
import { ordersController } from './orders.controller';
import { createOrderSchema, orderParamSchema, updateOrderStatusSchema } from './orders.schema';

export class OrdersModule {
  static register(group: RouteGroup): void {
    // All order routes require authentication
    group.use(authenticate);

    // POST /api/v1/orders/checkout
    group.post(
      '/checkout',
      (c) => ordersController.checkout(c),
      {
        summary: 'Checkout active shopping cart and create a new order',
        tags: ['Orders'],
        body: createOrderSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // GET /api/v1/orders
    group.get('/', (c) => ordersController.listOrders(c), {
      summary: 'List user order history (or all orders if admin)',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
    });

    // GET /api/v1/orders/:id
    group.get(
      '/:id',
      (c) => ordersController.getOrderById(c),
      {
        summary: 'Get order details by ID',
        tags: ['Orders'],
        params: orderParamSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // POST /api/v1/orders/:id/cancel
    group.post(
      '/:id/cancel',
      (c) => ordersController.cancelOrder(c),
      {
        summary: 'Cancel an order and restore product stock',
        tags: ['Orders'],
        params: orderParamSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // PATCH /api/v1/orders/:id/status (Admin only)
    group.patch(
      '/:id/status',
      (c) => ordersController.updateStatus(c),
      {
        summary: 'Update order status (Admin Only)',
        tags: ['Orders'],
        params: orderParamSchema,
        body: updateOrderStatusSchema,
        security: [{ bearerAuth: [] }],
      },
      [requireRole('admin')]
    );
  }
}
