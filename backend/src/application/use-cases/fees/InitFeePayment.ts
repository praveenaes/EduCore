import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IFeePaymentRepository } from '@/domain/repositories/IFeePaymentRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IPaymentService } from '@/application/ports/services/IPaymentService';
import { IInitFeePaymentUseCase } from '@/application/ports/use-cases/fees/IInitFeePaymentUseCase';
import {
  InitFeePaymentDTO,
  InitFeePaymentResponseDTO,
} from '@/application/dto/fees/feeDtos';
import { FeePayment } from '@/domain/entities/FeePayment';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@/shared/errors/AppError';

@injectable()
export class InitFeePayment implements IInitFeePaymentUseCase {
  constructor(
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository,
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository,
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository,
    @inject(TYPES.PaymentService)
    private _paymentService: IPaymentService
  ) {}

  async execute(dto: InitFeePaymentDTO): Promise<InitFeePaymentResponseDTO> {
    if (!dto.feeAssignmentId) {
      throw new BadRequestError('Fee assignment ID is required.');
    }

    const assignment = await this._feeRepo.findById(dto.feeAssignmentId);
    if (!assignment || assignment.isDeleted) {
      throw new NotFoundError('Fee assignment not found.');
    }

    // Verify ownership if initiated by student
    const student = await this._studentRepo.findByUserId(dto.userId);
    if (student && assignment.studentId !== student.id) {
      throw new ForbiddenError('You are not authorized to pay for this fee assignment.');
    }

    if (assignment.status === 'completed') {
      throw new BadRequestError('This fee assignment has already been paid.');
    }

    const transactionId = crypto.randomUUID();
    const assignmentIdStr = assignment.id || 'fee';
    const receipt = `rcpt_${assignmentIdStr.slice(-8)}_${Date.now().toString().slice(-6)}`;

    // 1. Create pending FeePayment entity
    const feePayment = FeePayment.createNew({
      feeAssignmentId: assignmentIdStr,
      studentId: assignment.studentId,
      amount: assignment.amount,
      paymentMethod: 'razorpay',
      transactionId,
    });
    const createdPayment = await this._paymentRepo.create(feePayment);

    // 2. Create Razorpay order
    const order = await this._paymentService.createOrder({
      amount: assignment.amount,
      currency: 'INR',
      receipt,
      notes: {
        feeAssignmentId: assignmentIdStr,
        studentId: assignment.studentId,
        transactionId,
      },
    });

    // 3. Update payment record with generated gateway order ID
    if (createdPayment.id) {
      await this._paymentRepo.update(createdPayment.id, {
        gatewayOrderId: order.orderId,
      });
    }

    return {
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: this._paymentService.getKeyId(),
      transactionId,
      feeAssignment: {
        id: assignmentIdStr,
        title: assignment.title,
        amount: assignment.amount,
      },
      payerName: student
        ? `${student.firstName} ${student.lastName}`.trim()
        : undefined,
      payerEmail: student?.email,
      payerPhone: student?.phone,
    };
  }
}
