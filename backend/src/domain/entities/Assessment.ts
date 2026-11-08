export type AssessmentStatus = 'SCHEDULED' | 'COMPLETED' | 'GRADED' | 'PUBLISHED' | 'CANCELLED';
export type DelegationStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface AssessmentProps {
  id?: string;
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: Date;
  endDate: Date;
  status: AssessmentStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  delegationStatus?: DelegationStatus;
  delegationReason?: string;
  delegatedAt?: Date;
  delegationReviewedAt?: Date;

  // Populated fields for quick display
  academicYearName?: string;
  academicYearCode?: string;
  courseName?: string;
  courseCode?: string;
  levelName?: string;
}

export class Assessment {
  private _props: AssessmentProps;

  constructor(props: AssessmentProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get name(): string { return this._props.name; }
  get academicYearId(): string { return this._props.academicYearId; }
  get courseId(): string { return this._props.courseId; }
  get levelNumber(): number { return this._props.levelNumber; }
  get startDate(): Date { return this._props.startDate; }
  get endDate(): Date { return this._props.endDate; }
  get status(): AssessmentStatus { return this._props.status; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get academicYearName(): string | undefined { return this._props.academicYearName; }
  get academicYearCode(): string | undefined { return this._props.academicYearCode; }
  get courseName(): string | undefined { return this._props.courseName; }
  get courseCode(): string | undefined { return this._props.courseCode; }
  get levelName(): string | undefined { return this._props.levelName; }
  get delegationStatus(): DelegationStatus { return this._props.delegationStatus || 'NONE'; }
  get delegationReason(): string | undefined { return this._props.delegationReason; }
  get delegatedAt(): Date | undefined { return this._props.delegatedAt; }
  get delegationReviewedAt(): Date | undefined { return this._props.delegationReviewedAt; }

  // Business Methods
  updateDetails(details: {
    name: string;
    academicYearId: string;
    courseId: string;
    levelNumber: number;
    startDate: Date;
    endDate: Date;
  }): void {
    this._props.name = details.name.trim();
    this._props.academicYearId = details.academicYearId;
    this._props.courseId = details.courseId;
    this._props.levelNumber = details.levelNumber;
    this._props.startDate = details.startDate;
    this._props.endDate = details.endDate;
    this._props.updatedAt = new Date();
  }

  updateStatus(status: AssessmentStatus): void {
    this._props.status = status;
    this._props.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  requestDelegation(reason: string): void {
    this._props.delegationStatus = 'REQUESTED';
    this._props.delegationReason = reason.trim();
    this._props.delegatedAt = new Date();
    this._props.updatedAt = new Date();
  }

  reviewDelegation(status: 'APPROVED' | 'REJECTED'): void {
    this._props.delegationStatus = status;
    this._props.delegationReviewedAt = new Date();
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    academicYearId: string;
    courseId: string;
    levelNumber: number;
    startDate: Date;
    endDate: Date;
    status?: AssessmentStatus;
  }): Assessment {
    return new Assessment({
      name: props.name.trim(),
      academicYearId: props.academicYearId,
      courseId: props.courseId,
      levelNumber: props.levelNumber,
      startDate: props.startDate,
      endDate: props.endDate,
      status: props.status || 'SCHEDULED',
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      academicYearId: this.academicYearId,
      courseId: this.courseId,
      levelNumber: this.levelNumber,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      academicYearName: this.academicYearName,
      academicYearCode: this.academicYearCode,
      courseName: this.courseName,
      courseCode: this.courseCode,
      levelName: this.levelName,
      delegationStatus: this.delegationStatus,
      delegationReason: this.delegationReason,
      delegatedAt: this.delegatedAt,
      delegationReviewedAt: this.delegationReviewedAt,
    };
  }
}
