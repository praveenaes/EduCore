export type DelegationStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface AssessmentScheduleProps {
  id?: string;
  assessmentId: string;
  courseId: string;
  levelNumber: number;
  criteriaId: string;
  batchId: string;
  centerId: string;
  examDate: Date;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isCompleted: boolean;
  isGraded: boolean;
  isPublished?: boolean;
  delegationStatus?: DelegationStatus;
  delegationReason?: string;
  delegatedAt?: Date;
  delegationReviewedAt?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated display helpers
  assessmentName?: string;
  assessmentStatus?: string;
  courseName?: string;
  courseCode?: string;
  levelName?: string;
  criteriaName?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  batchName?: string;
  centerName?: string;
  centerCode?: string;
}

export class AssessmentSchedule {
  private _props: AssessmentScheduleProps;

  constructor(props: AssessmentScheduleProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get assessmentId(): string { return this._props.assessmentId; }
  get courseId(): string { return this._props.courseId; }
  get levelNumber(): number { return this._props.levelNumber; }
  get criteriaId(): string { return this._props.criteriaId; }
  get batchId(): string { return this._props.batchId; }
  get centerId(): string { return this._props.centerId; }
  get examDate(): Date { return this._props.examDate; }
  get startTime(): string { return this._props.startTime; }
  get endTime(): string { return this._props.endTime; }
  get isCompleted(): boolean { return this._props.isCompleted; }
  get isGraded(): boolean { return this._props.isGraded ?? false; }
  get isPublished(): boolean { return this._props.isPublished ?? false; }
  get delegationStatus(): DelegationStatus { return this._props.delegationStatus ?? 'NONE'; }
  get delegationReason(): string | undefined { return this._props.delegationReason; }
  get delegatedAt(): Date | undefined { return this._props.delegatedAt; }
  get delegationReviewedAt(): Date | undefined { return this._props.delegationReviewedAt; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  get assessmentName(): string | undefined { return this._props.assessmentName; }
  get assessmentStatus(): string | undefined { return this._props.assessmentStatus; }
  get courseName(): string | undefined { return this._props.courseName; }
  get courseCode(): string | undefined { return this._props.courseCode; }
  get levelName(): string | undefined { return this._props.levelName; }
  get criteriaName(): string | undefined { return this._props.criteriaName; }
  get subjectId(): string | undefined { return this._props.subjectId; }
  get subjectName(): string | undefined { return this._props.subjectName; }
  get subjectCode(): string | undefined { return this._props.subjectCode; }
  get batchName(): string | undefined { return this._props.batchName; }
  get centerName(): string | undefined { return this._props.centerName; }
  get centerCode(): string | undefined { return this._props.centerCode; }

  // Business Methods
  updateDetails(details: {
    assessmentId: string;
    courseId: string;
    levelNumber: number;
    criteriaId: string;
    batchId: string;
    centerId: string;
    examDate: Date;
    startTime: string;
    endTime: string;
  }): void {
    this._props.assessmentId = details.assessmentId;
    this._props.courseId = details.courseId;
    this._props.levelNumber = details.levelNumber;
    this._props.criteriaId = details.criteriaId;
    this._props.batchId = details.batchId;
    this._props.centerId = details.centerId;
    this._props.examDate = details.examDate;
    this._props.startTime = details.startTime;
    this._props.endTime = details.endTime;
    this._props.updatedAt = new Date();
  }

  markAsGraded(): void {
    this._props.isGraded = true;
    this._props.isCompleted = true;
    this._props.updatedAt = new Date();
  }

  markAsCompleted(): void {
    this._props.isCompleted = true;
    this._props.updatedAt = new Date();
  }

  publish(): void {
    this._props.isPublished = true;
    this._props.updatedAt = new Date();
  }

  unpublish(): void {
    this._props.isPublished = false;
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

  toggleCompleted(): void {
    this._props.isCompleted = !this._props.isCompleted;
    this._props.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    assessmentId: string;
    courseId: string;
    levelNumber: number;
    criteriaId: string;
    batchId: string;
    centerId: string;
    examDate: Date;
    startTime: string;
    endTime: string;
  }): AssessmentSchedule {
    return new AssessmentSchedule({
      assessmentId: props.assessmentId,
      courseId: props.courseId,
      levelNumber: props.levelNumber,
      criteriaId: props.criteriaId,
      batchId: props.batchId,
      centerId: props.centerId,
      examDate: props.examDate,
      startTime: props.startTime,
      endTime: props.endTime,
      isCompleted: false,
      isGraded: false,
      isPublished: false,
      delegationStatus: 'NONE',
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      assessmentId: this.assessmentId,
      courseId: this.courseId,
      levelNumber: this.levelNumber,
      criteriaId: this.criteriaId,
      batchId: this.batchId,
      centerId: this.centerId,
      examDate: this.examDate,
      startTime: this.startTime,
      endTime: this.endTime,
      isCompleted: this.isCompleted,
      isGraded: this.isGraded,
      isPublished: this.isPublished,
      delegationStatus: this.delegationStatus,
      delegationReason: this.delegationReason,
      delegatedAt: this.delegatedAt,
      delegationReviewedAt: this.delegationReviewedAt,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      assessmentName: this.assessmentName,
      assessmentStatus: this.assessmentStatus,
      courseName: this.courseName,
      courseCode: this.courseCode,
      levelName: this.levelName,
      criteriaName: this.criteriaName,
      subjectId: this.subjectId,
      subjectName: this.subjectName,
      subjectCode: this.subjectCode,
      batchName: this.batchName,
      centerName: this.centerName,
      centerCode: this.centerCode,
    };
  }
}
