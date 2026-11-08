export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'overdue'
  | 'partial'
  | 'failed'
  | 'refunded';

export type RefundStatus = 'none' | 'requested' | 'approved' | 'rejected';

export interface FeeAssignmentProps {
  id?: string;
  title: string;
  studentId: string;
  userId?: string;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  refundStatus?: RefundStatus;
  refundReason?: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  studentName?: string;
  admissionNumber?: string;
  batchName?: string;
}

export class FeeAssignment {
  private _props: FeeAssignmentProps;

  constructor(props: FeeAssignmentProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get title(): string {
    return this._props.title;
  }

  get studentId(): string {
    return this._props.studentId;
  }

  get userId(): string | undefined {
    return this._props.userId;
  }

  get amount(): number {
    return this._props.amount;
  }

  get dueDate(): Date {
    return this._props.dueDate;
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

  get batchName(): string | undefined {
    return this._props.batchName;
  }

  // Business Methods
  markCompleted(): void {
    this._props.status = 'completed';
    this._props.updatedAt = new Date();
  }

  markOverdue(): void {
    this._props.status = 'overdue';
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

  markRefunded(): void {
    this._props.status = 'refunded';
    this._props.refundStatus = 'approved';
    this._props.updatedAt = new Date();
  }

  updateDetails(details: {
    title: string;
    amount: number;
    dueDate: Date;
    remarks?: string;
  }): void {
    this._props.title = details.title.trim();
    this._props.amount = details.amount;
    this._props.dueDate = details.dueDate;
    this._props.remarks = details.remarks ? details.remarks.trim() : undefined;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    title: string;
    studentId: string;
    userId?: string;
    amount: number;
    dueDate: Date;
    remarks?: string;
  }): FeeAssignment {
    return new FeeAssignment({
      title: props.title.trim(),
      studentId: props.studentId,
      userId: props.userId,
      amount: props.amount,
      dueDate: props.dueDate,
      status: 'pending',
      remarks: props.remarks ? props.remarks.trim() : undefined,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      studentId: this.studentId,
      userId: this.userId,
      amount: this.amount,
      dueDate: this.dueDate,
      status: this.status,
      refundStatus: this.refundStatus,
      refundReason: this.refundReason,
      remarks: this.remarks,
      studentName: this.studentName,
      admissionNumber: this.admissionNumber,
      batchName: this.batchName,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
