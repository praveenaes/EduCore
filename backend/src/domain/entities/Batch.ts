export interface BatchProps {
  id?: string;
  name: string;
  courseId: string;
  levelNumber: number;
  levelName: string;
  centerId: string;
  academicYearId: string;
  teacherId?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated helper fields
  courseName?: string;
  courseCode?: string;
  centerName?: string;
  academicYearName?: string;
  teacherName?: string;
  teacherEmployeeId?: string;
}

export class Batch {
  private _props: BatchProps;

  constructor(props: BatchProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined { return this._props.id; }
  get name(): string { return this._props.name; }
  get courseId(): string { return this._props.courseId; }
  get levelNumber(): number { return this._props.levelNumber; }
  get levelName(): string { return this._props.levelName; }
  get centerId(): string { return this._props.centerId; }
  get academicYearId(): string { return this._props.academicYearId; }
  get teacherId(): string | undefined { return this._props.teacherId; }
  get isActive(): boolean { return this._props.isActive; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get courseName(): string | undefined { return this._props.courseName; }
  get courseCode(): string | undefined { return this._props.courseCode; }
  get centerName(): string | undefined { return this._props.centerName; }
  get academicYearName(): string | undefined { return this._props.academicYearName; }
  get teacherName(): string | undefined { return this._props.teacherName; }
  get teacherEmployeeId(): string | undefined { return this._props.teacherEmployeeId; }

  // Business Methods
  updateDetails(details: {
    name?: string;
    courseId?: string;
    levelNumber?: number;
    levelName?: string;
    centerId?: string;
    academicYearId?: string;
    teacherId?: string | null;
    isActive?: boolean;
  }): void {
    if (details.name !== undefined) this._props.name = details.name.trim();
    if (details.courseId !== undefined) this._props.courseId = details.courseId;
    if (details.levelNumber !== undefined) this._props.levelNumber = details.levelNumber;
    if (details.levelName !== undefined) this._props.levelName = details.levelName;
    if (details.centerId !== undefined) this._props.centerId = details.centerId;
    if (details.academicYearId !== undefined) this._props.academicYearId = details.academicYearId;
    // null = explicitly clear teacher; undefined/missing key = don't touch
    if ('teacherId' in details) this._props.teacherId = details.teacherId ?? undefined;
    if (details.isActive !== undefined) this._props.isActive = details.isActive;
    this._props.updatedAt = new Date();
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    courseId: string;
    levelNumber: number;
    levelName: string;
    centerId: string;
    academicYearId: string;
    teacherId?: string;
  }): Batch {
    return new Batch({
      name: props.name.trim(),
      courseId: props.courseId,
      levelNumber: props.levelNumber,
      levelName: props.levelName,
      centerId: props.centerId,
      academicYearId: props.academicYearId,
      teacherId: props.teacherId,
      isActive: true,
      isDeleted: false,
    });
  }
}
