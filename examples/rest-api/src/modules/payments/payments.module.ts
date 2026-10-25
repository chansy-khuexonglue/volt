import { RouteGroup } from 'volt';
import { authenticate } from '../../common/guards/auth.guard';
import { paymentsController } from './payments.controller';
import { paymentParamSchema, processPaymentSchema } from './payments.schema';

export class PaymentsModule {
  static register(group: RouteGroup): void {
    group.use(authenticate);

    // POST /api/v1/payments
    group.post(
      '/',
      (c) => paymentsController.pay(c),
      {
        summary: 'Process payment for a pending order',
        tags: ['Payments'],
        body: processPaymentSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    // GET /api/v1/payments/:id
    group.get(
      '/:id',
      (c) => paymentsController.getPayment(c),
      {
        summary: 'Get payment transaction receipt by ID',
        tags: ['Payments'],
        params: paymentParamSchema,
        security: [{ bearerAuth: [] }],
      }
    );
  }
}
