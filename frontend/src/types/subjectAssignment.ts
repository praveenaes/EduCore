export interface SubjectAssignment {
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
  createdAt?: string;
}

export interface SubjectAssignmentListResponse {
  success: boolean;
  data: {
    assignments: SubjectAssignment[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface CreateSubjectAssignmentPayload {
  courseId: string;
  levelNumber: number;
  subjectId: string;
  teacherId?: string;
}

export type UpdateSubjectAssignmentPayload = Partial<CreateSubjectAssignmentPayload>;
