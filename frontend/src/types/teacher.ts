export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: string;
  qualifications: string;
  specializations: string;
  experience: number;
  salary: number;
  gender: string;
  dateOfBirth: string;
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
  isDeleted?: boolean;
  isActive?: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherPayload {
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: string;
  qualifications: string;
  specializations: string;
  experience: number;
  salary: number;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  nationalId: string;
  phone: string;
  email: string;
  house: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  photo?: File | null;
  removePhoto?: string;
}

export interface TeacherListResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
