export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'medical' | 'casual' | 'family' | 'other';
export type HalfDaySession = 'firstHalf' | 'secondHalf';

export interface LeaveRescheduleRequest {
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: Date;
  remarks?: string;
}

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
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reviewedBy?: string; // userId of teacher / reviewer
  reviewedAt?: Date;
  remarks?: string;
  rescheduleRequest?: LeaveRescheduleRequest;
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
      isHalfDay: props.isHalfDay ?? false,
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
  get isHalfDay(): boolean { return this._props.isHalfDay ?? false; }
  get halfDaySession(): HalfDaySession | undefined { return this._props.halfDaySession; }
  get reviewedBy(): string | undefined { return this._props.reviewedBy; }
  get reviewedAt(): Date | undefined { return this._props.reviewedAt; }
  get remarks(): string | undefined { return this._props.remarks; }
  get rescheduleRequest(): LeaveRescheduleRequest | undefined { return this._props.rescheduleRequest; }
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

  updateDetails(props: {
    startDate?: Date;
    endDate?: Date;
    type?: LeaveType;
    reason?: string;
    isHalfDay?: boolean;
    halfDaySession?: HalfDaySession;
  }): void {
    if (props.startDate !== undefined) this._props.startDate = props.startDate;
    if (props.endDate !== undefined) this._props.endDate = props.endDate;
    if (props.type !== undefined) this._props.type = props.type;
    if (props.reason !== undefined) this._props.reason = props.reason.trim();
    if (props.isHalfDay !== undefined) this._props.isHalfDay = props.isHalfDay;
    if (props.halfDaySession !== undefined) this._props.halfDaySession = props.halfDaySession;
    this._props.updatedAt = new Date();
  }

  reschedule(props: {
    startDate: Date;
    endDate: Date;
    isHalfDay?: boolean;
    halfDaySession?: HalfDaySession;
    reason?: string;
  }): void {
    this._props.startDate = props.startDate;
    this._props.endDate = props.endDate;
    this._props.isHalfDay = props.isHalfDay ?? false;
    this._props.halfDaySession = props.isHalfDay ? props.halfDaySession : undefined;
    if (props.reason?.trim()) {
      this._props.reason = props.reason.trim();
    }
    this._props.status = 'pending';
    this._props.rescheduleRequest = undefined;
    this._props.updatedAt = new Date();
  }

  requestReschedule(props: {
    startDate: Date;
    endDate: Date;
    isHalfDay?: boolean;
    halfDaySession?: HalfDaySession;
    reason: string;
  }): void {
    this._props.rescheduleRequest = {
      startDate: props.startDate,
      endDate: props.endDate,
      isHalfDay: props.isHalfDay ?? false,
      halfDaySession: props.isHalfDay ? props.halfDaySession : undefined,
      reason: props.reason.trim(),
      status: 'pending',
      requestedAt: new Date(),
    };
    this._props.updatedAt = new Date();
  }

  reviewReschedule(status: 'approved' | 'rejected', remarks?: string, reviewerId?: string): void {
    if (!this._props.rescheduleRequest) {
      throw new Error('No pending reschedule request found.');
    }
    const now = new Date();
    this._props.rescheduleRequest.status = status;
    if (remarks !== undefined) {
      this._props.rescheduleRequest.remarks = remarks.trim();
    }
    if (reviewerId) {
      this._props.rescheduleRequest.reviewedBy = reviewerId;
    }
    this._props.rescheduleRequest.reviewedAt = now;

    if (status === 'approved') {
      this._props.startDate = this._props.rescheduleRequest.startDate;
      this._props.endDate = this._props.rescheduleRequest.endDate;
      this._props.isHalfDay = this._props.rescheduleRequest.isHalfDay;
      this._props.halfDaySession = this._props.rescheduleRequest.halfDaySession;
      if (remarks) {
        this._props.remarks = remarks.trim();
      }
      if (reviewerId) {
        this._props.reviewedBy = reviewerId;
      }
      this._props.reviewedAt = now;
    }
    this._props.updatedAt = now;
  }

  cancel(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    studentId: string;
    batchId: string;
    startDate: Date;
    endDate: Date;
    type: LeaveType;
    reason: string;
    isHalfDay?: boolean;
    halfDaySession?: HalfDaySession;
  }): LeaveRequest {
    const now = new Date();
    return new LeaveRequest({
      ...props,
      reason: props.reason.trim(),
      isHalfDay: props.isHalfDay ?? false,
      halfDaySession: props.isHalfDay ? props.halfDaySession : undefined,
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
      isHalfDay: this.isHalfDay,
      halfDaySession: this.halfDaySession,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      remarks: this.remarks,
      rescheduleRequest: this.rescheduleRequest,
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
