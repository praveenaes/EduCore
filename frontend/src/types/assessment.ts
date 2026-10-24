export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export const STANDARD_EXAM_PRESETS = [
  'First Unit Test',
  'First Mid-Term Examination',
  'Quarterly Examination',
  'Second Unit Test',
  'Half-Yearly Examination',
  'Third Mid-Term Examination',
  'Model Examination',
  'Annual Final Examination',
] as const;

export type StandardExamPreset = (typeof STANDARD_EXAM_PRESETS)[number];

export interface Assessment {
  id: string;
  name: string;
  academicYearId: string;
  academicYearName?: string;
  startDate: string;
  endDate: string;
  status: AssessmentStatus;
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
  startDate: string;
  endDate: string;
}

export interface UpdateAssessmentPayload {
  name?: string;
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
  status?: AssessmentStatus;
}

export interface AssessmentFormData {
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}
