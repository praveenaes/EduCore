export type FeeAudienceType = 'batch' | 'center' | 'course' | 'student';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'overdue'
  | 'partial'
  | 'failed'
  | 'refunded';

export type RefundStatus = 'none' | 'requested' | 'approved' | 'rejected';

export interface FeeAssignment {
  id: string;
  title: string;
  studentId: string;
  userId?: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  refundStatus?: RefundStatus;
  refundReason?: string;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  studentName?: string;
  admissionNumber?: string;
  batchName?: string;
}

export interface FeeListResponse {
  success: boolean;
  message: string;
  data: {
    feeAssignments: FeeAssignment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FeeFilterParams {
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

export interface CreateFeeAssignmentPayload {
  title: string;
  amount: number;
  dueDate: string;
  remarks?: string;
  audience: FeeAudienceType;
  batchIds?: string[];
  centerIds?: string[];
  courseIds?: string[];
  studentIds?: string[];
}

export interface CreateFeeAssignmentResponse {
  success: boolean;
  message: string;
  data: {
    createdCount: number;
    assignments: FeeAssignment[];
  };
}

export interface InitFeePaymentResponse {
  success: boolean;
  message: string;
  data: {
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
  };
}

export interface ConfirmFeePaymentPayload {
  transactionId: string;
  gatewayOrderId: string;
  gatewayTransactionId: string;
  gatewaySignature: string;
}

export interface ConfirmFeePaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId?: string;
    status: string;
  };
}

export interface PaymentTransaction {
  id: string;
  feeAssignmentId: string;
  studentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  refundStatus?: RefundStatus;
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
  paidAt?: string;
  failureReason?: string;
  createdAt?: string;
}

export interface PaymentLedgerStats {
  totalCollections: number;
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
}

export interface PaymentLedgerResponse {
  success: boolean;
  message: string;
  data: {
    transactions: PaymentTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: PaymentLedgerStats;
  };
}

export interface PaymentLedgerFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
