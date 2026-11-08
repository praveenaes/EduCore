import { FeePayment } from '../entities/FeePayment';
import { IBaseRepository } from './IBaseRepository';

export interface PaymentLedgerFilters {
  status?: string;
  paymentMethod?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaymentLedgerPagination {
  page: number;
  limit: number;
}

export interface PaymentLedgerStats {
  totalCollections: number;
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
}

export interface PaymentLedgerResult {
  transactions: FeePayment[];
  total: number;
  stats: PaymentLedgerStats;
}

export interface IFeePaymentRepository extends IBaseRepository<FeePayment> {
  findByTransactionId(transactionId: string): Promise<FeePayment | null>;
  findByGatewayOrderId(gatewayOrderId: string): Promise<FeePayment | null>;
  findByFeeAssignmentId(feeAssignmentId: string): Promise<FeePayment[]>;
  findAllWithStats(
    filters: PaymentLedgerFilters,
    pagination: PaymentLedgerPagination
  ): Promise<PaymentLedgerResult>;
}
