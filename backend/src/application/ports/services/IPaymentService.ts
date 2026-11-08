export interface CreateOrderParams {
  amount: number; // in rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number; // in paise for checkout modal
  currency: string;
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentDetailsResult {
  paymentMethod: string;
  bank?: string;
  vpa?: string;
  gatewayRrn?: string;
  status: string;
}

export interface CreateRefundParams {
  paymentId: string;
  amount?: number; // in rupees (if omitted, full refund is issued)
  notes?: Record<string, string>;
}

export interface CreateRefundResult {
  refundId: string;
  amount: number;
  status: string;
}

export interface IPaymentService {
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifySignature(params: VerifySignatureParams): boolean;
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
  fetchPayment(paymentId: string): Promise<PaymentDetailsResult>;
  createRefund(params: CreateRefundParams): Promise<CreateRefundResult>;
  getKeyId(): string;
}
