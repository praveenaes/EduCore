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
  batchId: string;
  batchName?: string;
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
  batchId: string;
  photo?: File | null;
  removePhoto?: string;
}

export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, 'admissionNumber'>>;

export interface StudentCurriculumResponse {
  success: boolean;
  message?: string;
  data: {
    studentStatus: string;
    program: {
      id?: string;
      name: string;
      code?: string;
    };
    course: {
      id?: string;
      name: string;
      code?: string;
    };
    level: {
      levelNumber: number;
      levelName: string;
    };
    batch: {
      id?: string;
      name: string;
    };
    center: {
      id?: string;
      name: string;
    };
    academicYear: {
      id?: string;
      name: string;
    };
    batchTeacher: {
      id?: string;
      name: string;
      employeeId?: string;
    };
    subjects: Array<{
      id: string;
      name: string;
      code: string;
      teacherName?: string;
      teacherEmployeeId?: string;
    }>;
  };
}
