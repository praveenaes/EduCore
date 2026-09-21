export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  levelNumber: number;
  levelName: string;
  centerId: string;
  centerName?: string;
  academicYearId: string;
  academicYearName?: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmployeeId?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchListResponse {
  success: boolean;
  message: string;
  data: {
    batches: Batch[];
    total: number;
  };
}

export interface CreateBatchPayload {
  name: string;
  courseId: string;
  levelNumber: number;
  centerId: string;
  academicYearId: string;
  teacherId?: string | null;
}

export interface UpdateBatchPayload {
  name?: string;
  courseId?: string;
  levelNumber?: number;
  centerId?: string;
  academicYearId?: string;
  teacherId?: string | null;
  isActive?: boolean;
}
