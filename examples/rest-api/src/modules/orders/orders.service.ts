import { orderJobQueue } from '../../common/jobs/ecommerce-jobs';
import { cartService } from '../cart/cart.service';
import { productsService } from '../products/products.service';
import { CreateOrderDto, Order, OrderItem, OrderStatus } from './orders.types';

export class OrdersService {
  private orders: Order[] = [];

  createFromCart(
    userId: string,
    customerEmail: string,
    customerName: string,
    dto: CreateOrderDto
  ): Order {
    const cart = cartService.getCart(userId);
    if (!cart.items.length) {
      throw new Error('Cannot checkout an empty shopping cart');
    }

    // 1. Verify stock availability for all items before committing
    for (const item of cart.items) {
      const product = productsService.findById(item.productId);
      if (!product) {
        throw new Error(`Product "${item.name}" is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Product "${product.name}" does not have enough stock (${product.stock} available)`
        );
      }
    }

    // 2. Decrement inventory for each purchased item
    for (const item of cart.items) {
      const product = productsService.findById(item.productId)!;
      productsService.update(product.id, {
        stock: product.stock - item.quantity,
      });
    }

    // 3. Compute totals
    const subtotal = cart.totalPrice;
    const shippingFee = subtotal >= 200 ? 0 : 15.0; // Free shipping on orders >= $200
    const tax = Number((subtotal * 0.08).toFixed(2)); // 8% tax
    const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));

    const orderItems: OrderItem[] = cart.items.map((i) => ({ ...i }));

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      userId,
      items: orderItems,
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      status: 'pending',
      shippingAddress: dto.shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.push(newOrder);

    // 4. Clear the shopping cart
    cartService.clearCart(userId);

    // 5. Dispatch asynchronous background notification task
    orderJobQueue.add('sendOrderConfirmation', {
      orderId: newOrder.id,
      customerEmail,
      customerName,
      totalAmount,
    });

    return newOrder;
  }

  findAll(userId?: string, isAdmin = false): Order[] {
    if (isAdmin && !userId) {
      return [...this.orders];
    }
    return this.orders.filter((o) => o.userId === userId);
  }

  findById(orderId: string, userId?: string, isAdmin = false): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    if (!isAdmin && order.userId !== userId) {
      return undefined;
    }
    return order;
  }

  updateStatus(orderId: string, status: OrderStatus): Order {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order "${orderId}" not found`);
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  cancelOrder(orderId: string, userId?: string, isAdmin = false): Order {
    const order = this.findById(orderId, userId, isAdmin);
    if (!order) {
      throw new Error(`Order "${orderId}" not found`);
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Order cannot be cancelled because its current status is "${order.status}"`);
    }

    // Restore inventory
    for (const item of order.items) {
      const product = productsService.findById(item.productId);
      if (product) {
        productsService.update(product.id, {
          stock: product.stock + item.quantity,
        });
      }
    }

    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();
    return order;
  }
}

export const ordersService = new OrdersService();
