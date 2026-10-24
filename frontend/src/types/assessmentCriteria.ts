export type AssessmentCriteriaType = 'exam' | 'viva' | 'assignment' | 'project' | 'quiz' | 'other';
export type AssessmentType = AssessmentCriteriaType;

export const STANDARD_CRITERIA_PRESETS = [
  { name: 'Theory Paper', defaultType: 'exam' },
  { name: 'Practical Lab Exam', defaultType: 'exam' },
  { name: 'Viva Voce', defaultType: 'viva' },
  { name: 'Project Submission', defaultType: 'project' },
  { name: 'Assignment', defaultType: 'assignment' },
  { name: 'Unit Test / Quiz', defaultType: 'quiz' },
  { name: 'Seminar Presentation', defaultType: 'other' },
  { name: 'Continuous Internal Assessment (CIA)', defaultType: 'other' },
] as const;

export type StandardCriteriaPresetName = (typeof STANDARD_CRITERIA_PRESETS)[number]['name'];

export interface AssessmentCriteria {
  id: string;
  name: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  levelNumber: number;
  levelName?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  assessmentType: AssessmentCriteriaType;
  maxMarks: number;
  passMarks: number;
  hasCe: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentCriteriaListResponse {
  success: boolean;
  message: string;
  data: {
    criteria: AssessmentCriteria[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface CreateAssessmentCriteriaPayload {
  name: string;
  courseId: string;
  levelNumber: number;
  subjectId: string;
  assessmentType: AssessmentCriteriaType;
  maxMarks: number;
  passMarks: number;
  hasCe: boolean;
}

export type UpdateAssessmentCriteriaPayload = Partial<CreateAssessmentCriteriaPayload>;
