export interface AssessmentResult {
  id: string;
  assessmentId: string;
  scheduleId: string;
  criteriaId: string;
  batchId: string;
  studentId: string;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Populated display fields
  studentName?: string;
  admissionNumber?: string;
  studentEmail?: string;
  assessmentName?: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  levelNumber?: number;
  batchName?: string;
  criteriaName?: string;
  subjectName?: string;
  subjectCode?: string;
  maxMarks?: number;
  passMarks?: number;
  hasCe?: boolean;
}

export interface MarkEntryStudentRow {
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

export interface MarkEntrySheetData {
  scheduleId: string;
  assessmentId: string;
  assessmentName: string;
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
  students: MarkEntryStudentRow[];
}

export interface SaveMarksPayload {
  scheduleId: string;
  assessmentId?: string;
  batchId?: string;
  criteriaId?: string;
  marks: {
    studentId: string;
    marksObtained: number;
    ceMarksObtained?: number;
    isAbsent?: boolean;
    remarks?: string;
  }[];
}

export interface PublishResultsPayload {
  assessmentId: string;
  isPublished: boolean;
}

export interface StudentSubjectReport {
  subjectName: string;
  subjectCode?: string;
  criteriaName: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
  grade?: string;
  remarks?: string;
}

export interface StudentReportCardData {
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    email: string;
    batchName?: string;
  };
  assessment?: {
    id: string;
    name: string;
  };
  studentId?: string;
  studentName?: string;
  admissionNumber?: string;
  assessmentId?: string;
  assessmentName?: string;
  courseName?: string;
  levelName?: string;
  batchName?: string;
  subjects: StudentSubjectReport[];
  totalMarks?: number;
  totalMarksObtained?: number;
  totalMaxMarks: number;
  percentage: number;
  overallStatus: 'PASSED' | 'FAILED';
}
