export type FeeAudienceType = 'batch' | 'center' | 'course' | 'student';

export interface CreateFeeAssignmentsDTO {
  title: string;
  amount: number;
  dueDate: Date;
  remarks?: string;
  audience: FeeAudienceType;
  batchIds?: string[];
  centerIds?: string[];
  courseIds?: string[];
  studentIds?: string[];
}

export interface GetFeeAssignmentsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  studentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FeeAssignmentResponseDTO {
  id: string;
  title: string;
  studentId: string;
  userId?: string;
  amount: number;
  dueDate: Date;
  status: string;
  refundStatus?: string;
  refundReason?: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  studentName?: string;
  admissionNumber?: string;
  batchName?: string;
}

export interface CreateFeeAssignmentsResponseDTO {
  createdCount: number;
  assignments: FeeAssignmentResponseDTO[];
}

export interface FeeAssignmentListResultDTO {
  feeAssignments: FeeAssignmentResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InitFeePaymentDTO {
  feeAssignmentId: string;
  userId: string;
}

export interface InitFeePaymentResponseDTO {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  transactionId: string;
  feeAssignment: {
    id: string;
    title: string;
    amount: number;
  };
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface ConfirmFeePaymentDTO {
  feeAssignmentId: string;
  transactionId: string;
  gatewayOrderId: string;
  gatewayTransactionId: string;
  gatewaySignature: string;
}

export interface ConfirmFeePaymentResponseDTO {
  success: boolean;
  message: string;
  paymentId?: string;
  status: string;
}

export interface PaymentLedgerQueryDTO {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentTransactionDTO {
  id: string;
  feeAssignmentId: string;
  studentId: string;
  amount: number;
  currency: string;
  status: string;
  refundStatus?: string;
  refundReason?: string;
  paymentMethod?: string;
  bank?: string;
  vpa?: string;
  gatewayRrn?: string;
  gatewayOrderId?: string;
  gatewayTransactionId?: string;
  transactionId: string;
  studentName?: string;
  admissionNumber?: string;
  feeTitle?: string;
  paidAt?: Date;
  failureReason?: string;
  createdAt?: Date;
}

export interface PaymentLedgerStatsDTO {
  totalCollections: number;
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
}

export interface PaymentLedgerResponseDTO {
  transactions: PaymentTransactionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: PaymentLedgerStatsDTO;
}

export interface RefundFeePaymentDTO {
  paymentId: string;
  reason?: string;
  amount?: number;
}

export interface RefundFeePaymentResponseDTO {
  success: boolean;
  message: string;
  refundId: string;
  amount: number;
  status: string;
}

export interface RequestFeeRefundDTO {
  feeAssignmentId: string;
  userId: string;
  reason: string;
}

export interface RequestFeeRefundResponseDTO {
  success: boolean;
  message: string;
}

export interface RejectFeeRefundDTO {
  paymentId: string;
  remarks?: string;
}

export interface RejectFeeRefundResponseDTO {
  success: boolean;
  message: string;
}
