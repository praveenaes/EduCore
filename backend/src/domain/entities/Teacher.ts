export interface TeacherProps {
  id?: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: Date;
  qualifications: string;
  specializations: string;
  experience: number;
  salary: number;
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

export class Teacher {
  private _props: TeacherProps;

  constructor(props: TeacherProps) {
    this._props = { ...props };
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

  get employeeId(): string {
    return this._props.employeeId;
  }

  get joiningDate(): Date {
    return this._props.joiningDate;
  }

  get qualifications(): string {
    return this._props.qualifications;
  }

  get specializations(): string {
    return this._props.specializations;
  }

  get experience(): number {
    return this._props.experience;
  }

  get salary(): number {
    return this._props.salary;
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

  static createNew(props: Omit<TeacherProps, "id" | "isDeleted" | "isActive" | "createdAt" | "updatedAt">): Teacher {
    if (!props.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    return new Teacher({
      ...props,
      isActive: true,
      isDeleted: false,
    });
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      employeeId: this.employeeId,
      joiningDate: this.joiningDate,
      qualifications: this.qualifications,
      specializations: this.specializations,
      experience: this.experience,
      salary: this.salary,
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
