import { PaymentStatus, RefundStatus } from './FeeAssignment';

export interface FeePaymentProps {
  id?: string;
  feeAssignmentId: string;
  studentId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId: string;
  gatewayOrderId?: string;
  gatewayTransactionId?: string;
  gatewaySignature?: string;
  bank?: string;
  vpa?: string;
  gatewayRrn?: string;
  status: PaymentStatus;
  refundStatus?: RefundStatus;
  refundReason?: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Display helpers for ledger
  studentName?: string;
  admissionNumber?: string;
  feeTitle?: string;
}

export class FeePayment {
  private _props: FeePaymentProps;

  constructor(props: FeePaymentProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get feeAssignmentId(): string {
    return this._props.feeAssignmentId;
  }

  get studentId(): string {
    return this._props.studentId;
  }

  get amount(): number {
    return this._props.amount;
  }

  get paymentDate(): Date {
    return this._props.paymentDate;
  }

  get paymentMethod(): string {
    return this._props.paymentMethod;
  }

  get transactionId(): string {
    return this._props.transactionId;
  }

  get gatewayOrderId(): string | undefined {
    return this._props.gatewayOrderId;
  }

  get gatewayTransactionId(): string | undefined {
    return this._props.gatewayTransactionId;
  }

  get gatewaySignature(): string | undefined {
    return this._props.gatewaySignature;
  }

  get bank(): string | undefined {
    return this._props.bank;
  }

  get vpa(): string | undefined {
    return this._props.vpa;
  }

  get gatewayRrn(): string | undefined {
    return this._props.gatewayRrn;
  }

  get status(): PaymentStatus {
    return this._props.status;
  }

  get refundStatus(): RefundStatus {
    return this._props.refundStatus || 'none';
  }

  get refundReason(): string | undefined {
    return this._props.refundReason;
  }

  get remarks(): string | undefined {
    return this._props.remarks;
  }

  get isDeleted(): boolean {
    return this._props.isDeleted;
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._props.updatedAt;
  }

  get studentName(): string | undefined {
    return this._props.studentName;
  }

  get admissionNumber(): string | undefined {
    return this._props.admissionNumber;
  }

  get feeTitle(): string | undefined {
    return this._props.feeTitle;
  }

  // Business methods
  markCompleted(details: {
    gatewayTransactionId: string;
    gatewaySignature?: string;
    bank?: string;
    vpa?: string;
    gatewayRrn?: string;
    paymentMethod?: string;
    remarks?: string;
  }): void {
    this._props.status = 'completed';
    this._props.gatewayTransactionId = details.gatewayTransactionId;
    if (details.gatewaySignature) {
      this._props.gatewaySignature = details.gatewaySignature;
    }
    if (details.bank) {
      this._props.bank = details.bank;
    }
    if (details.vpa) {
      this._props.vpa = details.vpa;
    }
    if (details.gatewayRrn) {
      this._props.gatewayRrn = details.gatewayRrn;
    }
    if (details.paymentMethod) {
      this._props.paymentMethod = details.paymentMethod;
    }
    if (details.remarks) {
      this._props.remarks = details.remarks;
    }
    this._props.paymentDate = new Date();
    this._props.updatedAt = new Date();
  }

  markFailed(remarks?: string): void {
    this._props.status = 'failed';
    if (remarks) {
      this._props.remarks = remarks;
    }
    this._props.updatedAt = new Date();
  }

  requestRefund(reason: string): void {
    this._props.refundStatus = 'requested';
    this._props.refundReason = reason;
    this._props.updatedAt = new Date();
  }

  rejectRefund(remarks?: string): void {
    this._props.refundStatus = 'rejected';
    if (remarks) {
      this._props.remarks = remarks;
    }
    this._props.updatedAt = new Date();
  }

  markRefunded(details?: { remarks?: string }): void {
    this._props.status = 'refunded';
    this._props.refundStatus = 'approved';
    if (details?.remarks) {
      this._props.remarks = details.remarks;
    }
    this._props.updatedAt = new Date();
  }

  setGatewayOrderId(orderId: string): void {
    this._props.gatewayOrderId = orderId;
    this._props.updatedAt = new Date();
  }

  // Static Factory Method matching Program.ts & FeeAssignment.ts
  static createNew(props: {
    feeAssignmentId: string;
    studentId: string;
    amount: number;
    paymentMethod?: string;
    transactionId: string;
    gatewayOrderId?: string;
    remarks?: string;
  }): FeePayment {
    return new FeePayment({
      feeAssignmentId: props.feeAssignmentId,
      studentId: props.studentId,
      amount: props.amount,
      paymentMethod: props.paymentMethod || 'razorpay',
      transactionId: props.transactionId,
      gatewayOrderId: props.gatewayOrderId,
      remarks: props.remarks ? props.remarks.trim() : undefined,
      status: 'pending',
      paymentDate: new Date(),
      isDeleted: false,
    });
  }

  // Serialization matching Program.ts & FeeAssignment.ts
  toJSON() {
    return {
      id: this.id,
      feeAssignmentId: this.feeAssignmentId,
      studentId: this.studentId,
      amount: this.amount,
      paymentDate: this.paymentDate,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      gatewayOrderId: this.gatewayOrderId,
      gatewayTransactionId: this.gatewayTransactionId,
      gatewaySignature: this.gatewaySignature,
      bank: this.bank,
      vpa: this.vpa,
      gatewayRrn: this.gatewayRrn,
      status: this.status,
      refundStatus: this.refundStatus,
      refundReason: this.refundReason,
      remarks: this.remarks,
      studentName: this.studentName,
      admissionNumber: this.admissionNumber,
      feeTitle: this.feeTitle,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
