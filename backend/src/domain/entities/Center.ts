export interface ICenterAddress {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ICenterProgramInfo {
  id: string;
  name?: string;
  code?: string;
}

export interface ICenterProps {
  id?: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: ICenterAddress;
  status: 'active' | 'inactive';
  programs?: (ICenterProgramInfo | string)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Center {
  private _props: ICenterProps;

  constructor(props: ICenterProps) {
    this._props = { ...props };
  }

  get id(): string | undefined {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get code(): string {
    return this._props.code;
  }

  get phone(): string {
    return this._props.phone;
  }

  get email(): string {
    return this._props.email;
  }

  get timezone(): string {
    return this._props.timezone;
  }

  get address(): ICenterAddress {
    return this._props.address;
  }

  get status(): 'active' | 'inactive' {
    return this._props.status;
  }

  get programs(): (ICenterProgramInfo | string)[] {
    return this._props.programs || [];
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._props.updatedAt;
  }

  public updateDetails(props: {
    name?: string;
    code?: string;
    phone?: string;
    email?: string;
    timezone?: string;
    address?: ICenterAddress;
    status?: 'active' | 'inactive';
    programs?: (ICenterProgramInfo | string)[];
  }): void {
    if (props.name) this._props.name = props.name.trim();
    if (props.code) this._props.code = props.code.trim().toUpperCase();
    if (props.phone) this._props.phone = props.phone.trim();
    if (props.email) this._props.email = props.email.trim().toLowerCase();
    if (props.timezone) this._props.timezone = props.timezone.trim();
    if (props.address) this._props.address = props.address;
    if (props.status) this._props.status = props.status;
    if (props.programs !== undefined) this._props.programs = props.programs;
    this._props.updatedAt = new Date();
  }
}
