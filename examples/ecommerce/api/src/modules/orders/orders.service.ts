import { sql, Order, OrderItem, ShippingAddress } from '../../db';

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

    const rows = await sql`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, user_id,
        status, total_amount, subtotal, shipping_fee, items,
        shipping_address, payment_method, created_at
      ) VALUES (
        ${id},
        ${orderNumber},
        ${payload.customerName},
        ${payload.customerEmail},
        ${payload.userId || null},
        'confirmed',
        ${totalAmount},
        ${subtotal},
        ${shippingFee},
        ${JSON.stringify(payload.items)}::jsonb,
        ${JSON.stringify(payload.shippingAddress)}::jsonb,
        ${payload.paymentMethod || 'credit_card'},
        NOW()
      )
      RETURNING id, order_number, customer_name, customer_email, user_id,
                status, total_amount, subtotal, shipping_fee, items,
                shipping_address, payment_method, created_at
    `;

    return rows[0] as unknown as Order;
  }

  async getById(idOrNumber: string): Promise<Order | null> {
    const rows = await sql`
      SELECT id, order_number, customer_name, customer_email, user_id,
             status, total_amount, subtotal, shipping_fee, items,
             shipping_address, payment_method, created_at
      FROM orders
      WHERE id = ${idOrNumber} OR order_number = ${idOrNumber}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    return rows[0] as unknown as Order;
  }

  async getAll(limit: number = 20): Promise<Order[]> {
    const rows = await sql`
      SELECT id, order_number, customer_name, customer_email, user_id,
             status, total_amount, subtotal, shipping_fee, items,
             shipping_address, payment_method, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows as unknown as Order[];
  }
}

export const ordersService = new OrdersService();
