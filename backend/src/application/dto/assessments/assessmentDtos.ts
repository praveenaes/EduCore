import { AssessmentStatus, DelegationStatus } from '../../../domain/entities/Assessment';

export interface CreateAssessmentDTO {
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: Date;
  endDate: Date;
  status?: AssessmentStatus;
}

export interface UpdateAssessmentDTO {
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: Date;
  endDate: Date;
  status?: AssessmentStatus;
}

export interface AssessmentResponseDTO {
  id: string;
  name: string;
  academicYearId: string;
  courseId: string;
  levelNumber: number;
  startDate: Date;
  endDate: Date;
  status: AssessmentStatus;
  isDeleted: boolean;
  academicYearName?: string;
  academicYearCode?: string;
  courseName?: string;
  courseCode?: string;
  levelName?: string;
  delegationStatus?: DelegationStatus;
  delegationReason?: string;
  delegatedAt?: Date;
  delegationReviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestAssessmentDelegationDTO {
  reason: string;
}

export interface ReviewAssessmentDelegationDTO {
  status: 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
}

export interface AssessmentListResultDTO {
  assessments: AssessmentResponseDTO[];
  total: number;
}
