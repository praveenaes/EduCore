export interface CreateSubjectAssignmentDTO {
  courseId: string;
  levelNumber: number;
  subjectId: string;
  teacherId?: string;
}

export interface UpdateSubjectAssignmentDTO {
  levelNumber?: number;
  teacherId?: string;
}

export interface SubjectAssignmentResponseDTO {
  id: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  levelNumber: number;
  levelName: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmployeeId?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectAssignmentListResultDTO {
  assignments: SubjectAssignmentResponseDTO[];
  total: number;
}

export interface SubjectAssignmentQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  levelNumber?: number;
  subjectId?: string;
  teacherId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
