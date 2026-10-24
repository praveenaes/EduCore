import { AssessmentListResultDTO } from '@/application/dto/assessments/assessmentDtos';
import { AssessmentFilters, AssessmentPagination } from '@/domain/repositories/IAssessmentRepository';

export interface IGetAssessmentsUseCase {
  execute(filters: AssessmentFilters, pagination: AssessmentPagination): Promise<AssessmentListResultDTO>;
}
