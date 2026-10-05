import { HomeworkStatus } from '../../../domain/entities/Homework';

export interface HomeworkAttachmentDTO {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface HomeworkSubmissionItemDTO {
  id?: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  status: HomeworkStatus;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  remarks?: string;
  submissionAttachments: HomeworkAttachmentDTO[];
}

// Teacher Create
export interface CreateHomeworkDTO {
  title: string;
  description?: string;
  batchId: string;
  subjectId: string;
  dueDate: string;
  attachments?: HomeworkAttachmentDTO[];
  userId: string; // Authenticated Teacher's user ID
}

// Teacher Update
export interface UpdateHomeworkDTO {
  homeworkId: string;
  title?: string;
  description?: string;
  dueDate?: string;
  attachments?: HomeworkAttachmentDTO[];
  userId: string; // Authenticated Teacher's user ID
}

// Teacher List
export interface GetTeacherHomeworksDTO {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  batchId?: string;
}

export interface TeacherHomeworkItemDTO {
  id: string;
  title: string;
  description?: string;
  batchId: string;
  batchName?: string;
  subjectId: string;
  subjectName?: string;
  assignedBy: string;
  teacherName?: string;
  dueDate: string;
  attachments: HomeworkAttachmentDTO[];
  totalStudents: number;
  submittedCount: number;
  verifiedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherHomeworkListResponseDTO {
  homeworks: TeacherHomeworkItemDTO[];
  total: number;
  page: number;
  totalPages: number;
}

// Teacher Submissions View
export interface HomeworkSubmissionsResponseDTO {
  homework: TeacherHomeworkItemDTO;
  submissions: HomeworkSubmissionItemDTO[];
}

// Teacher Review
export interface ReviewSubmissionDTO {
  homeworkId: string;
  participantId: string;
  status: 'verified' | 'redo';
  remarks?: string;
  userId: string; // Teacher's user ID
}

// Student List
export interface GetStudentHomeworksDTO {
  userId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StudentHomeworkItemDTO {
  participantId: string;
  homeworkId: string;
  title: string;
  description?: string;
  subjectName: string;
  teacherName: string;
  dueDate: string;
  status: HomeworkStatus;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  remarks?: string;
  teacherAttachments: HomeworkAttachmentDTO[];
  submissionAttachments: HomeworkAttachmentDTO[];
}

export interface StudentHomeworkListResponseDTO {
  homeworks: StudentHomeworkItemDTO[];
  total: number;
  page: number;
  totalPages: number;
}

// Student Submit
export interface SubmitHomeworkDTO {
  participantId: string;
  userId: string;
  attachments: HomeworkAttachmentDTO[];
}
