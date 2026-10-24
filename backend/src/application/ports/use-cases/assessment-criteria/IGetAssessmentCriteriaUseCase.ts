import { AssessmentCriteriaListResultDTO } from '@/application/dto/assessments/assessmentCriteriaDtos';
import {
  AssessmentCriteriaFilters,
  AssessmentCriteriaPagination,
} from '@/domain/repositories/IAssessmentCriteriaRepository';

export interface IGetAssessmentCriteriaUseCase {
  execute(
    filters: AssessmentCriteriaFilters,
    pagination: AssessmentCriteriaPagination
  ): Promise<AssessmentCriteriaListResultDTO>;
}
