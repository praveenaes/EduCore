export type HomeworkStatus = 'pending' | 'submitted' | 'verified' | 'redo' | 'late';

export interface HomeworkAttachment {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface HomeworkExtensionRequest {
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  explanation?: string;
  attachment?: HomeworkAttachment;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  teacherRemarks?: string;
  extendedDueDate?: string | null;
}

// Single homework item as seen in lists and details
export interface Homework {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  batchId: string;
  batchName?: string;
  assignedBy?: string;
  teacherName?: string;
  dueDate: string; // ISO date string
  attachments: HomeworkAttachment[];
  totalStudents?: number;
  submittedCount?: number;
  verifiedCount?: number;
  pendingExtensionCount?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Student participant / submission detail for a homework
export interface HomeworkParticipant {
  id: string;
  homeworkId: string;
  homeworkTitle?: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  status: HomeworkStatus;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  remarks?: string;
  submissionAttachments: HomeworkAttachment[];
  extensionRequest?: HomeworkExtensionRequest | null;
}

// ==============================
// Teacher Portal Payloads & Responses
// ==============================

export interface TeacherHomeworkListResponse {
  success: boolean;
  message?: string;
  data: {
    homeworks: Homework[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface HomeworkSubmissionsResponse {
  success: boolean;
  message?: string;
  data: {
    homework: Homework;
    submissions: HomeworkParticipant[];
  };
}

export interface CreateHomeworkPayload {
  title: string;
  description?: string;
  batchId: string;
  subjectId: string;
  dueDate: string; // ISO date string
  attachments?: HomeworkAttachment[];
}

export interface UpdateHomeworkPayload {
  title?: string;
  description?: string;
  batchId?: string;
  subjectId?: string;
  dueDate?: string;
  attachments?: HomeworkAttachment[];
}

export interface ReviewSubmissionPayload {
  status: 'verified' | 'redo';
  remarks?: string;
}

export interface RequestHomeworkExtensionPayload {
  reason: string;
  explanation?: string;
  attachment?: HomeworkAttachment;
}

export interface ReviewHomeworkExtensionPayload {
  status: 'approved' | 'rejected';
  extendedDueDate?: string;
  teacherRemarks?: string;
}

// ==============================
// Student Portal Payloads & Responses
// ==============================

export interface StudentHomeworkItem {
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
  teacherAttachments: HomeworkAttachment[];
  submissionAttachments: HomeworkAttachment[];
  extensionRequest?: HomeworkExtensionRequest | null;
}

export interface StudentHomeworkListResponse {
  success: boolean;
  message?: string;
  data: {
    homeworks: StudentHomeworkItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface SubmitHomeworkPayload {
  attachments: HomeworkAttachment[];
}
