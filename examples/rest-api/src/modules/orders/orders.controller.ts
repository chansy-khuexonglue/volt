import { Context } from 'voltts';
import { ordersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.types';

export class OrdersController {
  checkout(c: Context<any, CreateOrderDto>) {
    try {
      const user = c.store.user;
      const order = ordersService.createFromCart(
        user.sub,
        user.email,
        user.name,
        c.body
      );
      return c.json(order, 201);
    } catch (err: any) {
      return c.json({ error: 'BadRequest', message: err.message }, 400);
    }
  }

  listOrders(c: Context) {
    const user = c.store.user;
    const isAdmin = user.role === 'admin';
    const orders = ordersService.findAll(isAdmin ? undefined : user.sub, isAdmin);
    return c.json({ count: orders.length, items: orders }, 200);
  }

  getOrderById(c: Context<{ id: string }>) {
    const user = c.store.user;
    const isAdmin = user.role === 'admin';
    const order = ordersService.findById(c.params.id, user.sub, isAdmin);
    if (!order) {
      return c.json({ error: 'NotFound', message: `Order "${c.params.id}" not found` }, 404);
    }
    return c.json(order, 200);
  }

  updateStatus(c: Context<{ id: string }, UpdateOrderStatusDto>) {
    try {
      const updated = ordersService.updateStatus(c.params.id, c.body.status);
      return c.json(updated, 200);
    } catch (err: any) {
      return c.json({ error: 'NotFound', message: err.message }, 404);
    }
  }

  cancelOrder(c: Context<{ id: string }>) {
    try {
      const user = c.store.user;
      const isAdmin = user.role === 'admin';
      const cancelled = ordersService.cancelOrder(c.params.id, user.sub, isAdmin);
      return c.json(cancelled, 200);
    } catch (err: any) {
      return c.json({ error: 'BadRequest', message: err.message }, 400);
    }
  }
}

export const ordersController = new OrdersController();
