import { t } from 'voltts';

export const paymentParamSchema = t.Object({
  id: t.String({ description: 'Payment identifier' }),
});

export const processPaymentSchema = t.Object({
  orderId: t.String({ description: 'ID of order to pay for' }),
  method: t.Enum([
    'credit_card',
    'paypal',
    'stripe',
    'cash_on_delivery',
  ] as const),
  cardLastFour: t.Optional(t.String({ minLength: 4, maxLength: 4 })),
});
