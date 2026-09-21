export interface CourseLevelProps {
  levelNumber: number;
  name: string;
}

export interface CourseProps {
  id?: string;
  programId: string;
  programName?: string;
  name: string;
  code: string;
  description: string;
  durationMonths?: number;
  levelName: string;
  levelCount: number;
  levels: CourseLevelProps[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Course {
  private _props: CourseProps;

  constructor(props: CourseProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get programId(): string {
    return this._props.programId;
  }

  get programName(): string | undefined {
    return this._props.programName;
  }

  get name(): string {
    return this._props.name;
  }

  get code(): string {
    return this._props.code;
  }

  get description(): string {
    return this._props.description;
  }

  get durationMonths(): number | undefined {
    return this._props.durationMonths;
  }

  get levelName(): string {
    return this._props.levelName;
  }

  get levelCount(): number {
    return this._props.levelCount;
  }

  get levels(): CourseLevelProps[] {
    return this._props.levels;
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

  // Business Methods
  updateDetails(details: {
    programId?: string;
    name?: string;
    code?: string;
    description?: string;
    durationMonths?: number;
    levelName?: string;
    levelCount?: number;
  }): void {
    if (details.programId !== undefined) this._props.programId = details.programId;
    if (details.name !== undefined) this._props.name = details.name.trim();
    if (details.code !== undefined) this._props.code = details.code.trim().toUpperCase();
    if (details.description !== undefined) this._props.description = details.description.trim();
    if (details.durationMonths !== undefined) this._props.durationMonths = details.durationMonths;

    const newLevelName = details.levelName !== undefined ? details.levelName.trim() : this._props.levelName;
    const newLevelCount = details.levelCount !== undefined ? details.levelCount : this._props.levelCount;

    if (details.levelName !== undefined || details.levelCount !== undefined) {
      this._props.levelName = newLevelName;
      this._props.levelCount = newLevelCount;
      this._props.levels = Course.generateLevels(newLevelName, newLevelCount);
    }

    this._props.updatedAt = new Date();
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static generateLevels(levelName: string, levelCount: number): CourseLevelProps[] {
    const trimmed = levelName.trim() || 'Level';
    const levels: CourseLevelProps[] = [];
    for (let i = 1; i <= levelCount; i++) {
      levels.push({
        levelNumber: i,
        name: trimmed + ' ' + i,
      });
    }
    return levels;
  }

  static createNew(props: {
    programId: string;
    programName?: string;
    name: string;
    code: string;
    description?: string;
    durationMonths?: number;
    levelName: string;
    levelCount: number;
  }): Course {
    const levels = Course.generateLevels(props.levelName, props.levelCount);

    return new Course({
      programId: props.programId,
      programName: props.programName,
      name: props.name.trim(),
      code: props.code.trim().toUpperCase(),
      description: props.description ? props.description.trim() : '',
      durationMonths: props.durationMonths ?? 0,
      levelName: props.levelName.trim(),
      levelCount: props.levelCount,
      levels,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      programId: this.programId,
      programName: this.programName,
      name: this.name,
      code: this.code,
      description: this.description,
      durationMonths: this.durationMonths,
      levelName: this.levelName,
      levelCount: this.levelCount,
      levels: this.levels,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
