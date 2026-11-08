import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IFeePaymentRepository } from '@/domain/repositories/IFeePaymentRepository';
import { IPaymentService } from '@/application/ports/services/IPaymentService';
import { IRefundFeePaymentUseCase } from '@/application/ports/use-cases/fees/IRefundFeePaymentUseCase';
import {
  RefundFeePaymentDTO,
  RefundFeePaymentResponseDTO,
} from '@/application/dto/fees/feeDtos';
import { BadRequestError, NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class RefundFeePayment implements IRefundFeePaymentUseCase {
  constructor(
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository,
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository,
    @inject(TYPES.PaymentService)
    private _paymentService: IPaymentService
  ) {}

  async execute(dto: RefundFeePaymentDTO): Promise<RefundFeePaymentResponseDTO> {
    if (!dto.paymentId) {
      throw new BadRequestError('Payment ID is required for refund.');
    }

    const payment = await this._paymentRepo.findById(dto.paymentId);
    if (!payment || payment.isDeleted) {
      throw new NotFoundError('Payment record not found.');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestError(
        `Cannot refund a payment with status "${payment.status}". Only completed payments can be refunded.`
      );
    }

    if (!payment.gatewayTransactionId) {
      throw new BadRequestError('Missing gateway transaction ID for refund processing.');
    }

    // Call Razorpay refund API
    const refundResult = await this._paymentService.createRefund({
      paymentId: payment.gatewayTransactionId,
      amount: dto.amount,
      notes: {
        reason: dto.reason || 'Admin initiated refund',
        feeAssignmentId: payment.feeAssignmentId,
      },
    });

    payment.markRefunded({ remarks: dto.reason || 'Refunded by administrator' });
    if (payment.id) {
      await this._paymentRepo.update(payment.id, {
        status: 'refunded',
        refundStatus: 'approved',
        remarks: dto.reason || 'Refunded by administrator',
      });
    }

    await this._feeRepo.update(payment.feeAssignmentId, {
      status: 'refunded',
      refundStatus: 'approved',
      remarks: dto.reason ? `Refunded: ${dto.reason}` : 'Fee payment refunded',
    });

    return {
      success: true,
      message: 'Fee payment refunded successfully.',
      refundId: refundResult.refundId,
      amount: refundResult.amount,
      status: refundResult.status,
    };
  }
}
