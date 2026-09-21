export interface ProgramProps {
  id?: string;
  name: string;
  code: string;
  description: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Program {
  private _props: ProgramProps;

  constructor(props: ProgramProps) {
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

  get description(): string {
    return this._props.description;
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
  updateDetails(name?: string, code?: string, description?: string): void {
    if (name !== undefined) this._props.name = name.trim();
    if (code !== undefined) this._props.code = code.trim().toUpperCase();
    if (description !== undefined) this._props.description = description.trim();
    this._props.updatedAt = new Date();
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    code: string;
    description: string;
  }): Program {
    return new Program({
      name: props.name.trim(),
      code: props.code.trim().toUpperCase(),
      description: props.description.trim(),
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}