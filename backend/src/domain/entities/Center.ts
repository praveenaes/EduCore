export interface ICenterAddress {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class Center {
  private _props: ICenterProps;

  constructor(props: ICenterProps) {
    this._props = {
      ...props,
      name: props.name.trim(),
      code: props.code.trim().toUpperCase(),
      phone: props.phone.trim(),
      email: props.email.trim().toLowerCase(),
      timezone: props.timezone.trim(),
      status: props.status || 'active',
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
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
  }): void {
    if (props.name) this._props.name = props.name.trim();
    if (props.code) this._props.code = props.code.trim().toUpperCase();
    if (props.phone) this._props.phone = props.phone.trim();
    if (props.email) this._props.email = props.email.trim().toLowerCase();
    if (props.timezone) this._props.timezone = props.timezone.trim();
    if (props.address) this._props.address = props.address;
    if (props.status) this._props.status = props.status;
    this._props.updatedAt = new Date();
  }
}
