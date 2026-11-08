import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IFeePaymentRepository } from '@/domain/repositories/IFeePaymentRepository';
import { IPaymentService } from '@/application/ports/services/IPaymentService';
import {
  IProcessFeeWebhookUseCase,
  ProcessFeeWebhookDTO,
  ProcessFeeWebhookResponseDTO,
} from '@/application/ports/use-cases/fees/IProcessFeeWebhookUseCase';
import { logger } from '@/infra/logger/logger';

@injectable()
export class ProcessFeeWebhook implements IProcessFeeWebhookUseCase {
  constructor(
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository,
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository,
    @inject(TYPES.PaymentService)
    private _paymentService: IPaymentService
  ) {}

  async execute(dto: ProcessFeeWebhookDTO): Promise<ProcessFeeWebhookResponseDTO> {
    const isValid = this._paymentService.verifyWebhookSignature(dto.rawBody, dto.signature);
    if (!isValid) {
      logger.warn('[Webhook] Invalid Razorpay webhook signature');
      return { success: false, message: 'Invalid webhook signature.' };
    }

    const event = dto.payload?.event;
    const paymentEntity = dto.payload?.payload?.payment?.entity;
    const orderEntity = dto.payload?.payload?.order?.entity;

    const gatewayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const transactionId =
      paymentEntity?.notes?.transactionId || orderEntity?.notes?.transactionId;

    let payment = gatewayOrderId
      ? await this._paymentRepo.findByGatewayOrderId(gatewayOrderId)
      : null;

    if (!payment && transactionId) {
      payment = await this._paymentRepo.findByTransactionId(transactionId);
    }

    if (!payment) {
      logger.info(`[Webhook] No matching payment record found for order ${gatewayOrderId}`);
      return { success: true, message: 'No matching payment record.' };
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      if (payment.status === 'completed') {
        return { success: true, message: 'Payment already completed.' };
      }

      const bank = paymentEntity?.bank;
      const vpa = paymentEntity?.vpa;
      const gatewayRrn =
        paymentEntity?.acquirer_data?.rrn || paymentEntity?.acquirer_data?.bank_transaction_id;
      const paymentMethod = paymentEntity?.method || 'online';
      const gatewayTransactionId = paymentEntity?.id;

      if (payment.id) {
        await this._paymentRepo.update(payment.id, {
          status: 'completed',
          gatewayTransactionId,
          bank,
          vpa,
          gatewayRrn,
          paymentMethod,
          paymentDate: new Date(),
        });
      }

      await this._feeRepo.update(payment.feeAssignmentId, {
        status: 'completed',
      });

      logger.info(`[Webhook] Fee payment completed successfully for assignment ${payment.feeAssignmentId}`);
      return { success: true, message: 'Payment captured and fee completed.' };
    }

    if (event === 'payment.failed') {
      if (payment.status !== 'completed' && payment.id) {
        await this._paymentRepo.update(payment.id, {
          status: 'failed',
          remarks: paymentEntity?.error_description || 'Payment failed at gateway.',
        });
      }
      return { success: true, message: 'Payment failure recorded.' };
    }

    return { success: true, message: `Event ${event} acknowledged.` };
  }
}
