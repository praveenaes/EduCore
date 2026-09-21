export interface IAcademicYearCenterInfo {
  id: string;
  name?: string;
  code?: string;
}

export interface AcademicYearProps {
  id?: string;
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  current: boolean;
  centers: (IAcademicYearCenterInfo | string)[]; // Can hold populated center details or string IDs
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AcademicYear {
  private _props: AcademicYearProps;

  constructor(props: AcademicYearProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get code(): string {
    return this._props.code;
  }

  get startDate(): Date {
    return this._props.startDate;
  }

  get endDate(): Date {
    return this._props.endDate;
  }

  get current(): boolean {
    return this._props.current;
  }

  get centers(): (IAcademicYearCenterInfo | string)[] {
    return [...this._props.centers];
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
    name?: string;
    code?: string;
    startDate?: Date;
    endDate?: Date;
    current?: boolean;
    centers?: (IAcademicYearCenterInfo | string)[];
  }): void {
    if (details.name !== undefined) this._props.name = details.name.trim();
    if (details.code !== undefined) this._props.code = details.code.trim().toUpperCase();
    if (details.startDate !== undefined) this._props.startDate = details.startDate;
    if (details.endDate !== undefined) this._props.endDate = details.endDate;
    if (details.current !== undefined) this._props.current = details.current;
    if (details.centers !== undefined) this._props.centers = [...details.centers];
    this._props.updatedAt = new Date();
  }

  setCurrent(current: boolean): void {
    this._props.current = current;
    this._props.updatedAt = new Date();
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    code: string;
    startDate: Date;
    endDate: Date;
    current?: boolean;
    centers?: (IAcademicYearCenterInfo | string)[];
  }): AcademicYear {
    return new AcademicYear({
      name: props.name.trim(),
      code: props.code.trim().toUpperCase(),
      startDate: props.startDate,
      endDate: props.endDate,
      current: props.current ?? false,
      centers: props.centers || [],
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      startDate: this.startDate,
      endDate: this.endDate,
      current: this.current,
      centers: this.centers,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
