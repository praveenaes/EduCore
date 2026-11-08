import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IFeePaymentRepository } from '@/domain/repositories/IFeePaymentRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IRequestFeeRefundUseCase } from '@/application/ports/use-cases/fees/IRequestFeeRefundUseCase';
import {
  RequestFeeRefundDTO,
  RequestFeeRefundResponseDTO,
} from '@/application/dto/fees/feeDtos';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class RequestFeeRefund implements IRequestFeeRefundUseCase {
  constructor(
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository,
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository,
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository
  ) {}

  async execute(dto: RequestFeeRefundDTO): Promise<RequestFeeRefundResponseDTO> {
    if (!dto.feeAssignmentId) {
      throw new BadRequestError('Fee assignment ID is required.');
    }
    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestError('A reason for the refund request is required.');
    }

    const assignment = await this._feeRepo.findById(dto.feeAssignmentId);
    if (!assignment || assignment.isDeleted) {
      throw new NotFoundError('Fee assignment not found.');
    }

    const student = await this._studentRepo.findByUserId(dto.userId);
    if (student && assignment.studentId !== student.id) {
      throw new ForbiddenError('You are not authorized to request a refund for this fee.');
    }

    if (assignment.status !== 'completed') {
      throw new BadRequestError('Refund can only be requested for completed fee payments.');
    }

    if (assignment.refundStatus === 'requested') {
      throw new BadRequestError('A refund request has already been submitted for this fee.');
    }

    if (assignment.refundStatus === 'approved') {
      throw new BadRequestError('This fee payment has already been refunded.');
    }

    const trimmedReason = dto.reason.trim();
    assignment.requestRefund(trimmedReason);
    await this._feeRepo.update(assignment.id!, {
      refundStatus: 'requested',
      refundReason: trimmedReason,
    });

    const payments = await this._paymentRepo.findByFeeAssignmentId(assignment.id!);
    const completedPayment = payments.find((p) => p.status === 'completed');
    if (completedPayment && completedPayment.id) {
      completedPayment.requestRefund(trimmedReason);
      await this._paymentRepo.update(completedPayment.id, {
        refundStatus: 'requested',
        refundReason: trimmedReason,
      });
    }

    return {
      success: true,
      message: 'Refund request submitted successfully. It will be reviewed by the administration.',
    };
  }
}
