import { AssessmentResult } from '../entities/AssessmentResult';
import { IBaseRepository } from './IBaseRepository';

export interface AssessmentResultFilters {
  search?: string;
  assessmentId?: string;
  scheduleId?: string;
  criteriaId?: string;
  courseId?: string;
  batchId?: string;
  studentId?: string;
  isAbsent?: boolean;
  isPassed?: boolean;
}

export interface AssessmentResultPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssessmentResultListResult {
  results: AssessmentResult[];
  total: number;
}

export interface IAssessmentResultRepository extends IBaseRepository<AssessmentResult> {
  findByScheduleAndStudent(
    scheduleId: string,
    studentId: string
  ): Promise<AssessmentResult | null>;

  findByScheduleId(scheduleId: string): Promise<AssessmentResult[]>;

  findByBatchAndCriteria(
    assessmentId: string,
    batchId: string,
    criteriaId: string
  ): Promise<AssessmentResult[]>;

  findByStudentAndAssessment(
    studentId: string,
    assessmentId: string
  ): Promise<AssessmentResult[]>;

  findByStudentId(studentId: string): Promise<AssessmentResult[]>;

  upsertMany(results: AssessmentResult[]): Promise<AssessmentResult[]>;

  findAll(
    filters: AssessmentResultFilters,
    pagination: AssessmentResultPagination
  ): Promise<AssessmentResultListResult>;

  softDelete(id: string): Promise<boolean>;
}
