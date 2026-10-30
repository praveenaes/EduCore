export interface StudentMarkItemDTO {
  studentId: string;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent?: boolean;
  remarks?: string;
}

export interface SaveAssessmentMarksDTO {
  scheduleId: string;
  assessmentId?: string;
  batchId?: string;
  criteriaId?: string;
  marks: StudentMarkItemDTO[];
}

export interface AssessmentResultResponseDTO {
  id: string;
  assessmentId: string;
  assessmentName?: string;
  scheduleId: string;
  criteriaId: string;
  criteriaName?: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  levelNumber?: number;
  levelName?: string;
  subjectName?: string;
  subjectCode?: string;
  batchId: string;
  batchName?: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  studentEmail?: string;
  maxMarks?: number;
  passMarks?: number;
  hasCe?: boolean;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
  remarks?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  centerName?: string;
  scheduleStatus?: 'SCHEDULED' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED';
  isPublished?: boolean;
  totalExamsInEvent?: number;
  completedExamsInEvent?: number;
  allExamsCompleted?: boolean;
  isDeleted: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AssessmentResultListResultDTO {
  results: AssessmentResultResponseDTO[];
  total: number;
}

export interface AssessmentResultQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  assessmentId?: string;
  scheduleId?: string;
  criteriaId?: string;
  courseId?: string;
  batchId?: string;
  studentId?: string;
  isAbsent?: boolean;
  isPassed?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MarkEntrySheetStudentDTO {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  currentResultId?: string;
  marksObtained?: number;
  ceMarksObtained?: number;
  isAbsent?: boolean;
  isPassed?: boolean;
  remarks?: string;
}

export interface MarkEntrySheetDTO {
  scheduleId: string;
  assessmentId: string;
  assessmentName: string;
  assessmentStatus?: string;
  isPublished?: boolean;
  isGraded?: boolean;
  courseId: string;
  courseName: string;
  levelNumber: number;
  batchId: string;
  batchName: string;
  criteriaId: string;
  criteriaName: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  hasCe: boolean;
  isCompleted?: boolean;
  students: MarkEntrySheetStudentDTO[];
}

export interface StudentSubjectResultDTO {
  criteriaId: string;
  subjectName: string;
  subjectCode: string;
  maxMarks: number;
  passMarks: number;
  hasCe: boolean;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
  grade?: string;
  remarks?: string;
}

export interface StudentReportCardDTO {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  assessmentId: string;
  assessmentName: string;
  courseName?: string;
  levelName?: string;
  batchName?: string;
  subjects: StudentSubjectResultDTO[];
  totalMaxMarks: number;
  totalMarksObtained: number;
  percentage: number;
  overallStatus: 'PASSED' | 'FAILED';
  overallGrade?: string;
}
