export interface OrganizationProps {
  id?: string;
  name?: string;
  logoPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization {
  private _props: OrganizationProps;

  constructor(props: OrganizationProps) {
    this._props = { ...props };
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get name(): string | undefined {
    return this._props.name;
  }

  get logoPath(): string | undefined {
    return this._props.logoPath;
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._props.updatedAt;
  }

  // Business Methods (e.g. updating name or logo)
  updateDetails(name?: string, logoPath?: string): void {
    if (name !== undefined) this._props.name = name;
    if (logoPath !== undefined) this._props.logoPath = logoPath;
  }

  toJSON(): OrganizationProps {
    return {
      id: this.id,
      name: this.name,
      logoPath: this.logoPath,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
