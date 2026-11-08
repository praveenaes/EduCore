import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IFeePaymentRepository } from '@/domain/repositories/IFeePaymentRepository';
import { IPaymentService } from '@/application/ports/services/IPaymentService';
import { IConfirmFeePaymentUseCase } from '@/application/ports/use-cases/fees/IConfirmFeePaymentUseCase';
import {
  ConfirmFeePaymentDTO,
  ConfirmFeePaymentResponseDTO,
} from '@/application/dto/fees/feeDtos';
import { BadRequestError, NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class ConfirmFeePayment implements IConfirmFeePaymentUseCase {
  constructor(
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository,
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository,
    @inject(TYPES.PaymentService)
    private _paymentService: IPaymentService
  ) {}

  async execute(dto: ConfirmFeePaymentDTO): Promise<ConfirmFeePaymentResponseDTO> {
    if (
      !dto.transactionId ||
      !dto.gatewayOrderId ||
      !dto.gatewayTransactionId ||
      !dto.gatewaySignature
    ) {
      throw new BadRequestError('Payment confirmation parameters are missing.');
    }

    const payment = await this._paymentRepo.findByTransactionId(dto.transactionId);
    if (!payment || payment.isDeleted) {
      throw new NotFoundError('Payment record not found.');
    }

    if (payment.status === 'completed') {
      return {
        success: true,
        message: 'Payment has already been confirmed.',
        paymentId: payment.id,
        status: 'completed',
      };
    }

    if (payment.status !== 'pending') {
      throw new BadRequestError('Invalid payment status for confirmation.');
    }

    const assignment = await this._feeRepo.findById(payment.feeAssignmentId);
    if (!assignment || assignment.isDeleted) {
      throw new NotFoundError('Fee assignment not found.');
    }

    // Cryptographic signature verification
    const isValidSignature = this._paymentService.verifySignature({
      orderId: dto.gatewayOrderId,
      paymentId: dto.gatewayTransactionId,
      signature: dto.gatewaySignature,
    });

    if (!isValidSignature) {
      if (payment.id) {
        await this._paymentRepo.update(payment.id, {
          status: 'failed',
          remarks: 'Gateway signature verification failed.',
        });
      }
      throw new BadRequestError('Payment verification failed. Invalid gateway signature.');
    }

    // Fetch gateway banking metadata (Bank name, UPI VPA, Bank RRN)
    const paymentDetails = await this._paymentService.fetchPayment(dto.gatewayTransactionId);

    // Update payment record to completed
    if (payment.id) {
      payment.markCompleted({
        gatewayTransactionId: dto.gatewayTransactionId,
        gatewaySignature: dto.gatewaySignature,
        bank: paymentDetails.bank,
        vpa: paymentDetails.vpa,
        gatewayRrn: paymentDetails.gatewayRrn,
        paymentMethod: paymentDetails.paymentMethod,
      });

      await this._paymentRepo.update(payment.id, {
        status: 'completed',
        gatewayTransactionId: dto.gatewayTransactionId,
        gatewaySignature: dto.gatewaySignature,
        bank: paymentDetails.bank,
        vpa: paymentDetails.vpa,
        gatewayRrn: paymentDetails.gatewayRrn,
        paymentMethod: paymentDetails.paymentMethod,
        paymentDate: new Date(),
      });
    }

    // Update fee assignment to completed
    if (assignment.id) {
      assignment.markCompleted();
      await this._feeRepo.update(assignment.id, {
        status: 'completed',
      });
    }

    return {
      success: true,
      message: 'Payment confirmed successfully.',
      paymentId: payment.id,
      status: 'completed',
    };
  }
}
