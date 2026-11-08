import { injectable } from 'inversify';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  IPaymentService,
  CreateOrderParams,
  CreateOrderResult,
  VerifySignatureParams,
  PaymentDetailsResult,
  CreateRefundParams,
  CreateRefundResult,
} from '../../application/ports/services/IPaymentService';
import { ENV } from '../../config/env.config';

@injectable()
export class RazorpayService implements IPaymentService {
  private _razorpay: Razorpay;

  constructor() {
    this._razorpay = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const amountInPaise = Math.round(params.amount * 100);
    const options = {
      amount: amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes,
      payment_capture: 1,
    };

    const order = await this._razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  }

  verifySignature(params: VerifySignatureParams): boolean {
    const body = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    return expectedSignature === params.signature;
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    const secret = (ENV.RAZORPAY_WEBHOOK_SECRET || '').trim();
    if (!secret || !signature) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const sigBuf = Buffer.from(signature, 'utf-8');

      if (expectedBuf.length !== sigBuf.length) return false;

      return crypto.timingSafeEqual(expectedBuf, sigBuf);
    } catch {
      return false;
    }
  }

  getKeyId(): string {
    return ENV.RAZORPAY_KEY_ID || '';
  }

  async fetchPayment(paymentId: string): Promise<PaymentDetailsResult> {
    try {
      const p: any = await this._razorpay.payments.fetch(paymentId);
      return {
        paymentMethod: p.method || 'online',
        bank: p.bank || (p.card ? `${p.card.network || ''} ${p.card.type || 'Card'}`.trim() : undefined),
        vpa: p.vpa || undefined,
        gatewayRrn: p.acquirer_data?.rrn || p.acquirer_data?.bank_transaction_id || undefined,
        status: p.status,
      };
    } catch {
      return {
        paymentMethod: 'online',
        status: 'captured',
      };
    }
  }

  async createRefund(params: CreateRefundParams): Promise<CreateRefundResult> {
    const options: any = {
      notes: params.notes,
    };
    if (params.amount && params.amount > 0) {
      options.amount = Math.round(params.amount * 100);
    }

    const refund = await this._razorpay.payments.refund(params.paymentId, options);

    return {
      refundId: refund.id,
      amount: Number(refund.amount) / 100,
      status: refund.status || 'processed',
    };
  }
}
