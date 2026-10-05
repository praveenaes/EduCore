export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceProps {
  id?: string;
  studentId: string;
  batchId: string;
  date: Date;
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
  markedBy: string; // userId of the teacher who marked it
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated display helpers
  studentName?: string;
  admissionNumber?: string;
}

export class Attendance {
  private _props: AttendanceProps;

  constructor(props: AttendanceProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get studentId(): string { return this._props.studentId; }
  get batchId(): string { return this._props.batchId; }
  get date(): Date { return this._props.date; }
  get firstHalf(): AttendanceStatus { return this._props.firstHalf; }
  get secondHalf(): AttendanceStatus { return this._props.secondHalf; }
  get remarks(): string | undefined { return this._props.remarks; }
  get markedBy(): string { return this._props.markedBy; }
  get isDeleted(): boolean { return this._props.isDeleted ?? false; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get studentName(): string | undefined { return this._props.studentName; }
  get admissionNumber(): string | undefined { return this._props.admissionNumber; }

  // Business Methods
  updateStatus(
    firstHalf: AttendanceStatus,
    secondHalf: AttendanceStatus,
    remarks?: string,
    markedBy?: string
  ): void {
    this._props.firstHalf = firstHalf;
    this._props.secondHalf = secondHalf;
    this._props.remarks = remarks?.trim();
    if (markedBy) this._props.markedBy = markedBy;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    studentId: string;
    batchId: string;
    date: Date;
    firstHalf: AttendanceStatus;
    secondHalf: AttendanceStatus;
    remarks?: string;
    markedBy: string;
  }): Attendance {
    return new Attendance({
      ...props,
      remarks: props.remarks?.trim(),
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      batchId: this.batchId,
      date: this.date,
      firstHalf: this.firstHalf,
      secondHalf: this.secondHalf,
      remarks: this.remarks,
      markedBy: this.markedBy,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      studentName: this.studentName,
      admissionNumber: this.admissionNumber,
    };
  }
}
