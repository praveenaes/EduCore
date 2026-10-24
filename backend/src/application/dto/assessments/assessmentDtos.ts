import { AssessmentStatus } from '../../../domain/entities/Assessment';

export interface CreateAssessmentDTO {
  name: string;
  academicYearId: string;
  startDate: Date;
  endDate: Date;
  status?: AssessmentStatus;
}

export interface UpdateAssessmentDTO {
  name?: string;
  academicYearId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AssessmentStatus;
}

export interface AssessmentResponseDTO {
  id: string;
  name: string;
  academicYearId: string;
  startDate: Date;
  endDate: Date;
  status: AssessmentStatus;
  isDeleted: boolean;
  academicYearName?: string;
  academicYearCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssessmentListResultDTO {
  assessments: AssessmentResponseDTO[];
  total: number;
}
