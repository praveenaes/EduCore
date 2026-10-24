export interface AssessmentSchedule {
  id: string;

  // Assessment Event
  assessmentId: string;
  assessmentName?: string;

  // Course & Level
  courseId: string;
  courseName?: string;
  courseCode?: string;
  levelNumber: number;
  levelName?: string;

  // Criteria & Subject
  criteriaId: string;
  criteriaName?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;

  // Batch
  batchId: string;
  batchName?: string;

  // Center
  centerId: string;
  centerName?: string;
  centerCode?: string;

  // Timetable
  examDate: string;      // YYYY-MM-DD
  startTime: string;     // HH:mm (e.g. "09:30")
  endTime: string;       // HH:mm (e.g. "12:30")

  // Status & Completion
  isCompleted: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentScheduleListResponse {
  success: boolean;
  message?: string;
  data: {
    schedules: AssessmentSchedule[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface CreateAssessmentSchedulePayload {
  assessmentId: string;
  courseId: string;
  levelNumber: number;
  criteriaId: string;
  batchId: string;
  centerId: string;
  examDate: string;
  startTime: string;
  endTime: string;
}

export interface UpdateAssessmentSchedulePayload {
  assessmentId?: string;
  courseId?: string;
  levelNumber?: number;
  criteriaId?: string;
  batchId?: string;
  centerId?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  isCompleted?: boolean;
}
