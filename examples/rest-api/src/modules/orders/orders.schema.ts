import { t } from 'voltts';

export const orderParamSchema = t.Object({
  id: t.String({ description: 'Order identifier' }),
});

export const shippingAddressSchema = t.Object({
  fullName: t.String({ minLength: 2, maxLength: 80, description: 'Recipient full name' }),
  addressLine1: t.String({ minLength: 5, maxLength: 120, description: 'Street address' }),
  addressLine2: t.Optional(t.String({ maxLength: 120 })),
  city: t.String({ minLength: 2, maxLength: 60, description: 'City' }),
  state: t.Optional(t.String({ maxLength: 60 })),
  postalCode: t.String({ minLength: 2, maxLength: 20, description: 'Postal / ZIP code' }),
  country: t.String({ minLength: 2, maxLength: 60, description: 'Country' }),
});

export const createOrderSchema = t.Object({
  shippingAddress: shippingAddressSchema,
});

export const updateOrderStatusSchema = t.Object({
  status: t.Enum([
    'pending',
    'processing',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
  ] as const),
});
