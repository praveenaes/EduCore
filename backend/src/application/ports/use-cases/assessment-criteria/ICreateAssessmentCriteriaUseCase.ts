import {
  CreateAssessmentCriteriaDTO,
  AssessmentCriteriaResponseDTO,
} from '@/application/dto/assessments/assessmentCriteriaDtos';

export interface ICreateAssessmentCriteriaUseCase {
  execute(dto: CreateAssessmentCriteriaDTO): Promise<AssessmentCriteriaResponseDTO>;
}
