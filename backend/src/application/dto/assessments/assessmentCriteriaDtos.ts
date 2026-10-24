import { AssessmentCriteriaType } from '../../../domain/entities/AssessmentCriteria';

export interface CreateAssessmentCriteriaDTO {
  name: string;
  courseId: string;
  levelNumber: number;
  subjectId: string;
  assessmentType: AssessmentCriteriaType;
  maxMarks: number;
  passMarks: number;
  hasCe?: boolean;
}

export interface UpdateAssessmentCriteriaDTO {
  name?: string;
  courseId?: string;
  levelNumber?: number;
  subjectId?: string;
  assessmentType?: AssessmentCriteriaType;
  maxMarks?: number;
  passMarks?: number;
  hasCe?: boolean;
}

export interface AssessmentCriteriaResponseDTO {
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AssessmentCriteriaListResultDTO {
  criteria: AssessmentCriteriaResponseDTO[];
  total: number;
}
