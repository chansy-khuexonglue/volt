import { prisma, Order, OrderItem, ShippingAddress } from '../../db';

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  userId?: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export class OrdersService {
  async checkout(payload: CheckoutPayload): Promise<Order> {
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Order items cannot be empty');
    }

    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomSuffix}`;

    const subtotal = Math.round(
      payload.items.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100
    ) / 100;
    const shippingFee = subtotal > 150 ? 0 : 15;
    const totalAmount = Math.round((subtotal + shippingFee) * 100) / 100;

    return prisma.order.create({
      data: {
        id,
        order_number: orderNumber,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        user_id: payload.userId || null,
        status: 'confirmed',
        total_amount: totalAmount,
        subtotal,
        shipping_fee: shippingFee,
        items: payload.items as any,
        shipping_address: payload.shippingAddress as any,
        payment_method: payload.paymentMethod || 'credit_card',
      },
    });
  }

  async getById(idOrNumber: string): Promise<Order | null> {
    return prisma.order.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { order_number: idOrNumber },
        ],
      },
    });
  }

  async getAll(limit: number = 20): Promise<Order[]> {
    return prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}

export const ordersService = new OrdersService();
