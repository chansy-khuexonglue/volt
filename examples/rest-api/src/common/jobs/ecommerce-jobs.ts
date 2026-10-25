import { JobQueue } from 'volt';

export interface OrderEmailPayload {
  orderId: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
}

export const orderJobQueue = new JobQueue({
  concurrency: 2,
});

// Define background worker for sending order confirmation notifications
orderJobQueue.define<OrderEmailPayload, { sent: boolean; messageId: string }>(
  'sendOrderConfirmation',
  async (job) => {
    // Simulate background asynchronous email/SMS dispatch
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      sent: true,
      messageId: `msg_${Date.now()}_${job.data.orderId}`,
    };
  }
);
