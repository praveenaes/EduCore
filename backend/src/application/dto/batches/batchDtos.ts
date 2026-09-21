export interface CreateBatchDTO {
  name: string;
  courseId: string;
  levelNumber: number;
  centerId: string;
  academicYearId: string;
  teacherId?: string | null;
}

export interface UpdateBatchDTO {
  name?: string;
  courseId?: string;
  levelNumber?: number;
  centerId?: string;
  academicYearId?: string;
  teacherId?: string | null;
  isActive?: boolean;
}

export interface BatchResponseDTO {
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

export interface BatchListResultDTO {
  batches: BatchResponseDTO[];
  total: number;
}
