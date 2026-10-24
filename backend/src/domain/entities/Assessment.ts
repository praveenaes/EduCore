export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export interface AssessmentProps {
  id?: string;
  name: string;
  academicYearId: string;
  startDate: Date;
  endDate: Date;
  status: AssessmentStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated fields for quick display
  academicYearName?: string;
  academicYearCode?: string;
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
  get startDate(): Date { return this._props.startDate; }
  get endDate(): Date { return this._props.endDate; }
  get status(): AssessmentStatus { return this._props.status; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }
  get academicYearName(): string | undefined { return this._props.academicYearName; }
  get academicYearCode(): string | undefined { return this._props.academicYearCode; }

  // Business Methods
  updateDetails(details: {
    name?: string;
    academicYearId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AssessmentStatus;
  }): void {
    if (details.name !== undefined) this._props.name = details.name.trim();
    if (details.academicYearId !== undefined) this._props.academicYearId = details.academicYearId;
    if (details.startDate !== undefined) this._props.startDate = details.startDate;
    if (details.endDate !== undefined) this._props.endDate = details.endDate;
    if (details.status !== undefined) this._props.status = details.status;
    this._props.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    academicYearId: string;
    startDate: Date;
    endDate: Date;
    status?: AssessmentStatus;
  }): Assessment {
    return new Assessment({
      name: props.name.trim(),
      academicYearId: props.academicYearId,
      startDate: props.startDate,
      endDate: props.endDate,
      status: props.status || 'DRAFT',
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      academicYearId: this.academicYearId,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      academicYearName: this.academicYearName,
      academicYearCode: this.academicYearCode,
    };
  }
}
