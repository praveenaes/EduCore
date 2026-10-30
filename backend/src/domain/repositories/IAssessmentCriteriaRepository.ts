import { AssessmentCriteria } from '../entities/AssessmentCriteria';
import { IBaseRepository } from './IBaseRepository';

export interface AssessmentCriteriaFilters {
  search?: string;
  courseId?: string;
  levelNumber?: number;
 
}

export interface AssessmentCriteriaPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssessmentCriteriaListResult {
  criteria: AssessmentCriteria[];
  total: number;
}

export interface IAssessmentCriteriaRepository extends IBaseRepository<AssessmentCriteria> {
  findByName(name: string): Promise<AssessmentCriteria | null>;
  findByNameAndScope(
    name: string,
    courseId: string,
    levelNumber: number,
    subjectId: string
  ): Promise<AssessmentCriteria | null>;
  findByCourseAndLevel(courseId: string, levelNumber: number): Promise<AssessmentCriteria[]>;
  findBySubjectId(subjectId: string): Promise<AssessmentCriteria[]>;
  findAll(
    filters: AssessmentCriteriaFilters,
    pagination: AssessmentCriteriaPagination
  ): Promise<AssessmentCriteriaListResult>;
  softDelete(id: string): Promise<boolean>;
}
