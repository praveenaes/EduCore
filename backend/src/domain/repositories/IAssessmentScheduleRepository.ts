import { AssessmentSchedule } from '../entities/AssessmentSchedule';
import { IBaseRepository } from './IBaseRepository';

export interface AssessmentScheduleFilters {
  search?: string;
  assessmentId?: string;
  courseId?: string;
  levelNumber?: number;
  criteriaId?: string;
  batchId?: string;
  centerId?: string;
  examDate?: Date;
  isCompleted?: boolean;
}

export interface AssessmentSchedulePagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssessmentScheduleListResult {
  schedules: AssessmentSchedule[];
  total: number;
}

export interface IAssessmentScheduleRepository extends IBaseRepository<AssessmentSchedule> {
  findByEventBatchCriteria(
    assessmentId: string,
    batchId: string,
    criteriaId: string
  ): Promise<AssessmentSchedule | null>;
  findByAssessmentId(assessmentId: string): Promise<AssessmentSchedule[]>;
  findByBatchId(batchId: string): Promise<AssessmentSchedule[]>;
  findByCriteriaId(criteriaId: string): Promise<AssessmentSchedule[]>;
  findByBatchAndDate(batchId: string, examDate: Date): Promise<AssessmentSchedule[]>;
  findAll(
    filters: AssessmentScheduleFilters,
    pagination: AssessmentSchedulePagination
  ): Promise<AssessmentScheduleListResult>;
  toggleCompleted(id: string): Promise<AssessmentSchedule | null>;
  softDelete(id: string): Promise<boolean>;
}
