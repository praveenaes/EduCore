import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  IFeePaymentRepository,
  PaymentLedgerFilters,
  PaymentLedgerPagination,
} from '@/domain/repositories/IFeePaymentRepository';
import { IGetPaymentLedgerUseCase } from '@/application/ports/use-cases/fees/IGetPaymentLedgerUseCase';
import {
  PaymentLedgerQueryDTO,
  PaymentLedgerResponseDTO,
} from '@/application/dto/fees/feeDtos';

@injectable()
export class GetPaymentLedger implements IGetPaymentLedgerUseCase {
  constructor(
    @inject(TYPES.FeePaymentRepository)
    private _paymentRepo: IFeePaymentRepository
  ) {}

  async execute(query: PaymentLedgerQueryDTO): Promise<PaymentLedgerResponseDTO> {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    const filters: PaymentLedgerFilters = {
      status: query.status,
      paymentMethod: query.paymentMethod,
      search: query.search?.trim(),
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const pagination: PaymentLedgerPagination = { page, limit };

    const result = await this._paymentRepo.findAllWithStats(filters, pagination);

    return {
      transactions: result.transactions.map((tx) => ({
        id: tx.id!,
        feeAssignmentId: tx.feeAssignmentId,
        studentId: tx.studentId,
        amount: tx.amount,
        currency: 'INR',
        status: tx.status,
        refundStatus: tx.refundStatus,
        refundReason: tx.refundReason,
        paymentMethod: tx.paymentMethod,
        bank: tx.bank,
        vpa: tx.vpa,
        gatewayRrn: tx.gatewayRrn,
        gatewayOrderId: tx.gatewayOrderId,
        gatewayTransactionId: tx.gatewayTransactionId,
        transactionId: tx.transactionId,
        studentName: tx.studentName,
        admissionNumber: tx.admissionNumber,
        feeTitle: tx.feeTitle,
        paidAt: tx.paymentDate,
        failureReason: tx.remarks,
        createdAt: tx.createdAt,
      })),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit) || 1,
      stats: result.stats,
    };
  }
}
