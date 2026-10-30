export interface CreateAssessmentScheduleDTO {
  assessmentId: string;
  courseId: string;
  levelNumber: number;
  criteriaId: string;
  batchId: string;
  centerId: string;
  examDate: Date | string;
  startTime: string;
  endTime: string;
}

export interface UpdateAssessmentScheduleDTO {
  assessmentId?: string;
  courseId?: string;
  levelNumber?: number;
  criteriaId?: string;
  batchId?: string;
  centerId?: string;
  examDate?: Date | string;
  startTime?: string;
  endTime?: string;
  isCompleted?: boolean;
}

export interface AssessmentScheduleResponseDTO {
  id: string;
  assessmentId: string;
  assessmentName?: string;
  assessmentStatus?: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  levelNumber: number;
  levelName?: string;
  criteriaId: string;
  criteriaName?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  batchId: string;
  batchName?: string;
  centerId: string;
  centerName?: string;
  centerCode?: string;
  examDate: Date | string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  isGraded?: boolean;
  isPublished?: boolean;
  isDeleted: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AssessmentScheduleListResultDTO {
  schedules: AssessmentScheduleResponseDTO[];
  total: number;
}

export interface AssessmentScheduleQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  assessmentId?: string;
  courseId?: string;
  levelNumber?: number;
  criteriaId?: string;
  batchId?: string;
  centerId?: string;
  isCompleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
