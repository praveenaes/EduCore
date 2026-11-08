import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IFeePaymentRepository } from '@/domain/repositories/IFeePaymentRepository';
import { IRejectFeeRefundUseCase } from '@/application/ports/use-cases/fees/IRejectFeeRefundUseCase';
import {
  RejectFeeRefundDTO,
  RejectFeeRefundResponseDTO,
} from '@/application/dto/fees/feeDtos';
import { BadRequestError, NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class RejectFeeRefund implements IRejectFeeRefundUseCase {
  constructor(
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository,
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository
  ) {}

  async execute(dto: RejectFeeRefundDTO): Promise<RejectFeeRefundResponseDTO> {
    if (!dto.paymentId) {
      throw new BadRequestError('Payment ID is required.');
    }

    const payment = await this._paymentRepo.findById(dto.paymentId);
    if (!payment || payment.isDeleted) {
      throw new NotFoundError('Payment record not found.');
    }

    if (payment.refundStatus !== 'requested') {
      throw new BadRequestError('No active refund request found for this payment.');
    }

    payment.rejectRefund(dto.remarks);
    if (payment.id) {
      await this._paymentRepo.update(payment.id, {
        refundStatus: 'rejected',
        remarks: dto.remarks ? `Refund rejected: ${dto.remarks}` : payment.remarks,
      });
    }

    const assignment = await this._feeRepo.findById(payment.feeAssignmentId);
    if (assignment && assignment.id) {
      assignment.rejectRefund(dto.remarks);
      await this._feeRepo.update(assignment.id, {
        refundStatus: 'rejected',
        remarks: dto.remarks ? `Refund rejected: ${dto.remarks}` : assignment.remarks,
      });
    }

    return {
      success: true,
      message: 'Refund request rejected successfully.',
    };
  }
}
