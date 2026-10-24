export interface AssessmentResultProps {
  id?: string;
  assessmentId: string;
  scheduleId: string;
  criteriaId: string;
  batchId: string;
  studentId: string;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
  remarks?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated display helpers
  studentName?: string;
  admissionNumber?: string;
  studentEmail?: string;
  assessmentName?: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  levelNumber?: number;
  levelName?: string;
  batchName?: string;
  criteriaName?: string;
  subjectName?: string;
  subjectCode?: string;
  maxMarks?: number;
  passMarks?: number;
  hasCe?: boolean;
}

export class AssessmentResult {
  private _props: AssessmentResultProps;

  constructor(props: AssessmentResultProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get assessmentId(): string { return this._props.assessmentId; }
  get scheduleId(): string { return this._props.scheduleId; }
  get criteriaId(): string { return this._props.criteriaId; }
  get batchId(): string { return this._props.batchId; }
  get studentId(): string { return this._props.studentId; }
  get marksObtained(): number { return this._props.marksObtained; }
  get ceMarksObtained(): number | undefined { return this._props.ceMarksObtained; }
  get isAbsent(): boolean { return this._props.isAbsent; }
  get isPassed(): boolean { return this._props.isPassed; }
  get remarks(): string | undefined { return this._props.remarks; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  // Populated display getters
  get studentName(): string | undefined { return this._props.studentName; }
  get admissionNumber(): string | undefined { return this._props.admissionNumber; }
  get studentEmail(): string | undefined { return this._props.studentEmail; }
  get assessmentName(): string | undefined { return this._props.assessmentName; }
  get courseId(): string | undefined { return this._props.courseId; }
  get courseName(): string | undefined { return this._props.courseName; }
  get courseCode(): string | undefined { return this._props.courseCode; }
  get levelNumber(): number | undefined { return this._props.levelNumber; }
  get levelName(): string | undefined { return this._props.levelName; }
  get batchName(): string | undefined { return this._props.batchName; }
  get criteriaName(): string | undefined { return this._props.criteriaName; }
  get subjectName(): string | undefined { return this._props.subjectName; }
  get subjectCode(): string | undefined { return this._props.subjectCode; }
  get maxMarks(): number | undefined { return this._props.maxMarks; }
  get passMarks(): number | undefined { return this._props.passMarks; }
  get hasCe(): boolean | undefined { return this._props.hasCe; }

  // Business Methods
  updateMarks(details: {
    marksObtained?: number;
    ceMarksObtained?: number;
    isAbsent?: boolean;
    remarks?: string;
    passMarks?: number;
  }): void {
    if (details.isAbsent !== undefined) {
      this._props.isAbsent = details.isAbsent;
    }

    if (details.marksObtained !== undefined) {
      this._props.marksObtained = details.marksObtained;
    }

    if (details.ceMarksObtained !== undefined) {
      this._props.ceMarksObtained = details.ceMarksObtained;
    }

    if (details.remarks !== undefined) {
      this._props.remarks = details.remarks;
    }

    if (this._props.isAbsent) {
      this._props.isPassed = false;
    } else if (details.passMarks !== undefined) {
      this._props.isPassed = this._props.marksObtained >= details.passMarks;
    }

    this._props.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    assessmentId: string;
    scheduleId: string;
    criteriaId: string;
    batchId: string;
    studentId: string;
    marksObtained: number;
    ceMarksObtained?: number;
    isAbsent?: boolean;
    passMarks?: number;
    remarks?: string;
  }): AssessmentResult {
    const isAbsent = Boolean(props.isAbsent);
    const isPassed = !isAbsent && props.passMarks !== undefined
      ? props.marksObtained >= props.passMarks
      : false;

    return new AssessmentResult({
      assessmentId: props.assessmentId,
      scheduleId: props.scheduleId,
      criteriaId: props.criteriaId,
      batchId: props.batchId,
      studentId: props.studentId,
      marksObtained: isAbsent ? 0 : props.marksObtained,
      ceMarksObtained: props.ceMarksObtained,
      isAbsent,
      isPassed,
      remarks: props.remarks,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      assessmentId: this.assessmentId,
      scheduleId: this.scheduleId,
      criteriaId: this.criteriaId,
      batchId: this.batchId,
      studentId: this.studentId,
      marksObtained: this.marksObtained,
      ceMarksObtained: this.ceMarksObtained,
      isAbsent: this.isAbsent,
      isPassed: this.isPassed,
      remarks: this.remarks,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      studentName: this.studentName,
      admissionNumber: this.admissionNumber,
      studentEmail: this.studentEmail,
      assessmentName: this.assessmentName,
      courseId: this.courseId,
      courseName: this.courseName,
      courseCode: this.courseCode,
      levelNumber: this.levelNumber,
      levelName: this.levelName,
      batchName: this.batchName,
      criteriaName: this.criteriaName,
      subjectName: this.subjectName,
      subjectCode: this.subjectCode,
      maxMarks: this.maxMarks,
      passMarks: this.passMarks,
      hasCe: this.hasCe,
    };
  }
}
