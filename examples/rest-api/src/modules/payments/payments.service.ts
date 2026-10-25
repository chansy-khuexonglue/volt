import { ordersService } from '../orders/orders.service';
import { Payment, ProcessPaymentDto } from './payments.types';

export class PaymentsService {
  private payments: Payment[] = [];

  processPayment(userId: string, dto: ProcessPaymentDto): Payment {
    const order = ordersService.findById(dto.orderId, userId, false);
    if (!order) {
      throw new Error(`Order "${dto.orderId}" not found`);
    }

    if (order.status !== 'pending') {
      throw new Error(
        `Cannot pay for order with status "${order.status}". Only pending orders can be paid.`
      );
    }

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      orderId: order.id,
      userId,
      amount: order.totalAmount,
      method: dto.method,
      status: 'completed',
      transactionRef: `tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    this.payments.push(newPayment);

    // Update order status to 'paid' and link paymentId
    ordersService.updateStatus(order.id, 'paid');
    order.paymentId = newPayment.id;

    return newPayment;
  }

  findById(paymentId: string, userId: string, isAdmin = false): Payment | undefined {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) return undefined;
    if (!isAdmin && payment.userId !== userId) {
      return undefined;
    }
    return payment;
  }

  findByOrderId(orderId: string, userId: string, isAdmin = false): Payment | undefined {
    const payment = this.payments.find((p) => p.orderId === orderId);
    if (!payment) return undefined;
    if (!isAdmin && payment.userId !== userId) {
      return undefined;
    }
    return payment;
  }
}

export const paymentsService = new PaymentsService();
