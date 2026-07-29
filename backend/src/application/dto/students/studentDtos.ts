export interface CreateStudentResponseDTO {
  id: string;
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
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
