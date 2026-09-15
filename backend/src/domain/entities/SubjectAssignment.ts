export interface SubjectAssignmentProps {
  id?: string;
  courseId: string;
  levelNumber: number;
  levelName: string;
  subjectId: string;
  teacherId?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated helper fields
  courseName?: string;
  courseCode?: string;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
  teacherEmployeeId?: string;
}

export class SubjectAssignment {
  private _props: SubjectAssignmentProps;

  constructor(props: SubjectAssignmentProps) {
    this._props = {
      ...props,
      levelName: props.levelName.trim(),
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get courseId(): string {
    return this._props.courseId;
  }

  get levelNumber(): number {
    return this._props.levelNumber;
  }

  get levelName(): string {
    return this._props.levelName;
  }

  get subjectId(): string {
    return this._props.subjectId;
  }

  get teacherId(): string | undefined {
    return this._props.teacherId;
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

  get subjectName(): string | undefined {
    return this._props.subjectName;
  }

  get subjectCode(): string | undefined {
    return this._props.subjectCode;
  }

  get teacherName(): string | undefined {
    return this._props.teacherName;
  }

  get teacherEmployeeId(): string | undefined {
    return this._props.teacherEmployeeId;
  }

  // Business Methods
  assignTeacher(teacherId: string | undefined): void {
    this._props.teacherId = teacherId;
    this._props.updatedAt = new Date();
  }

  updateDetails(details: {
    levelNumber?: number;
    levelName?: string;
    teacherId?: string;
  }): void {
    if (details.levelNumber !== undefined) this._props.levelNumber = details.levelNumber;
    if (details.levelName !== undefined) this._props.levelName = details.levelName.trim();
    if (details.teacherId !== undefined) this._props.teacherId = details.teacherId;
    this._props.updatedAt = new Date();
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    courseId: string;
    levelNumber: number;
    levelName: string;
    subjectId: string;
    teacherId?: string;
  }): SubjectAssignment {
    return new SubjectAssignment({
      courseId: props.courseId,
      levelNumber: props.levelNumber,
      levelName: props.levelName.trim(),
      subjectId: props.subjectId,
      teacherId: props.teacherId,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      courseId: this.courseId,
      levelNumber: this.levelNumber,
      levelName: this.levelName,
      subjectId: this.subjectId,
      teacherId: this.teacherId,
      isDeleted: this.isDeleted,
      courseName: this.courseName,
      courseCode: this.courseCode,
      subjectName: this.subjectName,
      subjectCode: this.subjectCode,
      teacherName: this.teacherName,
      teacherEmployeeId: this.teacherEmployeeId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
