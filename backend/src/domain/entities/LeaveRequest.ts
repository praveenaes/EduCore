export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'medical' | 'casual' | 'family' | 'other';

export interface LeaveRequestProps {
  id?: string;
  studentId: string;
  batchId: string;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedAt: Date;
  reviewedBy?: string; // userId of teacher / reviewer
  reviewedAt?: Date;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated display helpers
  studentName?: string;
  admissionNumber?: string;
  batchName?: string;
  reviewerName?: string;
}

export class LeaveRequest {
  private _props: LeaveRequestProps;

  constructor(props: LeaveRequestProps) {
    this._props = {
      ...props,
      isDeleted: props.isDeleted ?? false,
      status: props.status ?? 'pending',
    };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get studentId(): string { return this._props.studentId; }
  get batchId(): string { return this._props.batchId; }
  get startDate(): Date { return this._props.startDate; }
  get endDate(): Date { return this._props.endDate; }
  get type(): LeaveType { return this._props.type; }
  get reason(): string { return this._props.reason; }
  get status(): LeaveStatus { return this._props.status; }
  get appliedAt(): Date { return this._props.appliedAt; }
  get reviewedBy(): string | undefined { return this._props.reviewedBy; }
  get reviewedAt(): Date | undefined { return this._props.reviewedAt; }
  get remarks(): string | undefined { return this._props.remarks; }
  get isDeleted(): boolean { return this._props.isDeleted ?? false; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get studentName(): string | undefined { return this._props.studentName; }
  get admissionNumber(): string | undefined { return this._props.admissionNumber; }
  get batchName(): string | undefined { return this._props.batchName; }
  get reviewerName(): string | undefined { return this._props.reviewerName; }

  // Business Methods
  review(status: LeaveStatus, remarks?: string, reviewerId?: string): void {
    this._props.status = status;
    if (remarks !== undefined) {
      this._props.remarks = remarks.trim();
    }
    if (reviewerId) {
      this._props.reviewedBy = reviewerId;
    }
    this._props.reviewedAt = new Date();
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    studentId: string;
    batchId: string;
    startDate: Date;
    endDate: Date;
    type: LeaveType;
    reason: string;
  }): LeaveRequest {
    const now = new Date();
    return new LeaveRequest({
      ...props,
      reason: props.reason.trim(),
      status: 'pending',
      appliedAt: now,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      batchId: this.batchId,
      startDate: this.startDate,
      endDate: this.endDate,
      type: this.type,
      reason: this.reason,
      status: this.status,
      appliedAt: this.appliedAt,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      remarks: this.remarks,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      studentName: this.studentName,
      admissionNumber: this.admissionNumber,
      batchName: this.batchName,
      reviewerName: this.reviewerName,
    };
  }
}
