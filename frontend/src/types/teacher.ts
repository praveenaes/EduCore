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

export interface TeacherAssignedSubject {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  levelNumber: number;
  levelName: string;
  programName?: string;
  programCode?: string;
}

export interface TeacherInChargeBatch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  levelNumber: number;
  levelName: string;
  centerId: string;
  centerName: string;
  academicYearId: string;
  academicYearName: string;
}

export interface TeacherCurriculumResponse {
  success: boolean;
  message: string;
  data: {
    teacherStatus: 'Active' | 'Inactive';
    employeeId: string;
    specialization?: string;
    summary: {
      totalSubjects: number;
      totalBatches: number;
      totalCourses: number;
      totalCenters: number;
      totalPrograms: number;
    };
    scope: {
      programs: Array<{ id?: string; name: string; code?: string }>;
      courses: Array<{ id?: string; name: string; code?: string }>;
      levels: Array<{ levelNumber: number; levelName: string }>;
      centers: Array<{ id?: string; name: string }>;
      academicYears: Array<{ id?: string; name: string }>;
    };
    assignedSubjects: TeacherAssignedSubject[];
    inChargeBatches: TeacherInChargeBatch[];
  };
}
