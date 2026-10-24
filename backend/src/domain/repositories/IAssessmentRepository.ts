import { Assessment, AssessmentStatus } from '../entities/Assessment';
import { IBaseRepository } from './IBaseRepository';

export interface AssessmentFilters {
  search?: string;
  academicYearId?: string;
  status?: AssessmentStatus;
}

export interface AssessmentPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssessmentListResult {
  assessments: Assessment[];
  total: number;
}

export interface IAssessmentRepository extends IBaseRepository<Assessment> {
  findByName(name: string, academicYearId: string): Promise<Assessment | null>;
  findByAcademicYearId(academicYearId: string): Promise<Assessment[]>;
  findAll(filters: AssessmentFilters, pagination: AssessmentPagination): Promise<AssessmentListResult>;
  softDelete(id: string): Promise<boolean>;
}
