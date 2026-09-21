export interface CreateStudentDTO {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  admissionDate: string | Date;
  gender: string;
  dateOfBirth: string | Date;
  bloodGroup: string;
  nationalId: string;
  photo?: string;
  phone: string;
  email: string;
  house: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  batchId: string;
  removePhoto?: string;
}

export type UpdateStudentDTO = Partial<Omit<CreateStudentDTO, 'admissionNumber'>>;

export interface StudentResponseDTO {
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
  batchId: string;
  batchName?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateStudentResponseDTO = StudentResponseDTO;

export interface StudentListResultDTO {
  students: StudentResponseDTO[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
