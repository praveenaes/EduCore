export class Student {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly admissionNumber: string,
    public readonly admissionDate: Date,
    public readonly gender: string,
    public readonly dateOfBirth: Date,
    public readonly bloodGroup: string,
    public readonly nationalId: string,
    public readonly photo: string,
    public readonly phone: string,
    public readonly email: string,
    public readonly house: string,
    public readonly area: string,
    public readonly city: string,
    public readonly state: string,
    public readonly postalCode: string,
    public readonly country: string,
    public readonly isDeleted: boolean,
    public readonly isActive: boolean,
    public readonly userId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
