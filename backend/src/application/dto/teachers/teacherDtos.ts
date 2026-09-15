export interface CreateTeacherDTO {
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: string | Date;
  qualifications: string;
  specializations: string;
  experience: number | string;
  salary: number | string;
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
  removePhoto?: string;
}

export type UpdateTeacherDTO = Partial<CreateTeacherDTO>;

export interface TeacherResponseDTO {
  id: string;
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

export interface TeacherListResultDTO {
  teachers: TeacherResponseDTO[];
  total: number;
}
