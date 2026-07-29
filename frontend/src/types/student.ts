export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  admissionDate: string;
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
  isActive: boolean;
  userId: string;
}

export interface StudentListResponse {
  success: boolean;
  data: {
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  admissionDate: string;
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

export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, 'admissionNumber'>>;
