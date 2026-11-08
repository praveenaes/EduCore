import { Assessment, AssessmentStatus } from '../entities/Assessment';
import { IBaseRepository } from './IBaseRepository';

export interface AssessmentFilters {
  search?: string;
  academicYearId?: string;
  courseId?: string;
  levelNumber?: number;
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
  findByName(
    name: string,
    academicYearId: string,
    courseId: string,
    levelNumber: number
  ): Promise<Assessment | null>;
  findByAcademicYearId(academicYearId: string): Promise<Assessment[]>;
  findByCourseAndLevel(
    courseId: string,
    levelNumber: number,
    academicYearId?: string
  ): Promise<Assessment[]>;
  findAll(filters: AssessmentFilters, pagination: AssessmentPagination): Promise<AssessmentListResult>;
  softDelete(id: string): Promise<boolean>;
}
