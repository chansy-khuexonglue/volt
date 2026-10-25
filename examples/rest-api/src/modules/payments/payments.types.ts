export type PaymentMethod = 'credit_card' | 'paypal' | 'stripe' | 'cash_on_delivery';
export type PaymentStatus = 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
}

export interface ProcessPaymentDto {
  orderId: string;
  method: PaymentMethod;
  cardLastFour?: string;
}
