import { Context } from 'volt';
import { paymentsService } from './payments.service';
import { ProcessPaymentDto } from './payments.types';

export class PaymentsController {
  pay(c: Context<any, ProcessPaymentDto>) {
    try {
      const user = c.store.user;
      const payment = paymentsService.processPayment(user.sub, c.body);
      return c.json(payment, 201);
    } catch (err: any) {
      return c.json({ error: 'BadRequest', message: err.message }, 400);
    }
  }

  getPayment(c: Context<{ id: string }>) {
    const user = c.store.user;
    const isAdmin = user.role === 'admin';
    const payment = paymentsService.findById(c.params.id, user.sub, isAdmin);
    if (!payment) {
      return c.json({ error: 'NotFound', message: `Payment "${c.params.id}" not found` }, 404);
    }
    return c.json(payment, 200);
  }
}

export const paymentsController = new PaymentsController();
