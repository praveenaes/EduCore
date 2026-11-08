export type AssessmentStatus = 'SCHEDULED' | 'COMPLETED' | 'GRADED' | 'PUBLISHED' | 'CANCELLED';
export type DelegationStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';

export const STANDARD_EXAM_PRESETS = [
  'First Unit Test',
  'Second Unit Test',
  'Level Main Examination',
  'Practical Examination',
  'Project Evaluation',
  'Viva Voce',
] as const;

export type StandardExamPreset = (typeof STANDARD_EXAM_PRESETS)[number];

export interface Assessment {
  id: string;
  name: string;
  academicYearId: string;
  academicYearName?: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  levelNumber: number;
  levelName?: string;
  startDate: string;
  endDate: string;
  status: AssessmentStatus;
  delegationStatus?: DelegationStatus;
  delegationReason?: string;
  delegatedAt?: string;
  delegationReviewedAt?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentListResponse {
  success: boolean;
  message: string;
  data: {
    assessments: Assessment[];
    total: number;
  };
}

export interface CreateAssessmentPayload {
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: string;
  endDate: string;
}

export interface UpdateAssessmentPayload {
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: string;
  endDate: string;
  status?: AssessmentStatus;
}

export interface AssessmentFormData {
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: string;
  endDate: string;
  status?: AssessmentStatus;
}
