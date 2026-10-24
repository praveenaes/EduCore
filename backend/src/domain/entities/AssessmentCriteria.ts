export type AssessmentCriteriaType = 'exam' | 'viva' | 'assignment' | 'project' | 'quiz' | 'other';

export interface AssessmentCriteriaProps {
  id?: string;
  name: string;
  courseId: string;
  levelNumber: number;
  subjectId: string;
  assessmentType: AssessmentCriteriaType;
  maxMarks: number;
  passMarks: number;
  hasCe: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated helper fields for display
  courseName?: string;
  courseCode?: string;
  levelName?: string;
  subjectName?: string;
  subjectCode?: string;
}

export class AssessmentCriteria {
  private _props: AssessmentCriteriaProps;

  constructor(props: AssessmentCriteriaProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get courseId(): string {
    return this._props.courseId;
  }

  get levelNumber(): number {
    return this._props.levelNumber;
  }

  get subjectId(): string {
    return this._props.subjectId;
  }

  get assessmentType(): AssessmentCriteriaType {
    return this._props.assessmentType;
  }

  get maxMarks(): number {
    return this._props.maxMarks;
  }

  get passMarks(): number {
    return this._props.passMarks;
  }

  get hasCe(): boolean {
    return this._props.hasCe;
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

  get courseName(): string | undefined {
    return this._props.courseName;
  }

  get courseCode(): string | undefined {
    return this._props.courseCode;
  }

  get levelName(): string | undefined {
    return this._props.levelName;
  }

  get subjectName(): string | undefined {
    return this._props.subjectName;
  }

  get subjectCode(): string | undefined {
    return this._props.subjectCode;
  }

  // Business Methods
  updateDetails(details: {
    name?: string;
    courseId?: string;
    levelNumber?: number;
    subjectId?: string;
    assessmentType?: AssessmentCriteriaType;
    maxMarks?: number;
    passMarks?: number;
    hasCe?: boolean;
  }): void {
    if (details.name !== undefined) this._props.name = details.name.trim();
    if (details.courseId !== undefined) this._props.courseId = details.courseId;
    if (details.levelNumber !== undefined) this._props.levelNumber = details.levelNumber;
    if (details.subjectId !== undefined) this._props.subjectId = details.subjectId;
    if (details.assessmentType !== undefined) this._props.assessmentType = details.assessmentType;
    if (details.maxMarks !== undefined) this._props.maxMarks = details.maxMarks;
    if (details.passMarks !== undefined) this._props.passMarks = details.passMarks;
    if (details.hasCe !== undefined) this._props.hasCe = details.hasCe;
    this._props.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    courseId: string;
    levelNumber: number;
    subjectId: string;
    assessmentType: AssessmentCriteriaType;
    maxMarks: number;
    passMarks: number;
    hasCe?: boolean;
  }): AssessmentCriteria {
    return new AssessmentCriteria({
      name: props.name.trim(),
      courseId: props.courseId,
      levelNumber: props.levelNumber,
      subjectId: props.subjectId,
      assessmentType: props.assessmentType,
      maxMarks: props.maxMarks,
      passMarks: props.passMarks,
      hasCe: props.hasCe ?? false,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      courseId: this.courseId,
      levelNumber: this.levelNumber,
      subjectId: this.subjectId,
      assessmentType: this.assessmentType,
      maxMarks: this.maxMarks,
      passMarks: this.passMarks,
      hasCe: this.hasCe,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      courseName: this.courseName,
      courseCode: this.courseCode,
      levelName: this.levelName,
      subjectName: this.subjectName,
      subjectCode: this.subjectCode,
    };
  }
}
