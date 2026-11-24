export interface StudentProps {
  id?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  admissionDate: Date;
  gender: string;
  dateOfBirth: Date;
  bloodGroup: string;
  nationalId: string;
  photo: string;
  phone: string;
  email: string;
  house: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDeleted: boolean;
  isActive: boolean;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Student {
  private _props: StudentProps;

  constructor(props: StudentProps) {
    this._props = { ...props };//data stores here
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;
  }

  get firstName(): string {
    return this._props.firstName;
  }

  get lastName(): string {
    return this._props.lastName;
  }

  get admissionNumber(): string {
    return this._props.admissionNumber;
  }

  get admissionDate(): Date {
    return this._props.admissionDate;
  }

  get gender(): string {
    return this._props.gender;
  }

  get dateOfBirth(): Date {
    return this._props.dateOfBirth;
  }

  get bloodGroup(): string {
    return this._props.bloodGroup;
  }

  get nationalId(): string {
    return this._props.nationalId;
  }

  get photo(): string {
    return this._props.photo;
  }

  get phone(): string {
    return this._props.phone;
  }

  get email(): string {
    return this._props.email;
  }

  get house(): string {
    return this._props.house;
  }

  get area(): string {
    return this._props.area;
  }

  get city(): string {
    return this._props.city;
  }

  get state(): string {
    return this._props.state;
  }

  get postalCode(): string {
    return this._props.postalCode;
  }

  get country(): string {
    return this._props.country;
  }

  get isDeleted(): boolean {
    return this._props.isDeleted;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  get userId(): string {
    return this._props.userId;
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._props.updatedAt;
  }

  // Business Methods
  verifyIsActive(): void {
    if (!this._props.isActive) {
      throw new Error("Your account has been deactivated by the administrator.");
    }
  }

  deactivate(): void {
    this._props.isActive = false;
  }

  activate(): void {
    this._props.isActive = true;
  }

  changeEmail(newEmail: string): void {
    if (!newEmail.includes("@")) {
      throw new Error("Invalid email format");
    }
    this._props.email = newEmail;
  }

  static createNew(props: Omit<StudentProps, "id" | "isDeleted" | "isActive" | "createdAt" | "updatedAt">): Student {
    if (!props.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    return new Student({
      ...props,
      isActive: true,
      isDeleted: false,
    });
  }

  //flats the _props object and converts into strings
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      admissionNumber: this.admissionNumber,
      admissionDate: this.admissionDate,
      gender: this.gender,
      dateOfBirth: this.dateOfBirth,
      bloodGroup: this.bloodGroup,
      nationalId: this.nationalId,
      photo: this.photo,
      phone: this.phone,
      email: this.email,
      house: this.house,
      area: this.area,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      isDeleted: this.isDeleted,
      isActive: this.isActive,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
