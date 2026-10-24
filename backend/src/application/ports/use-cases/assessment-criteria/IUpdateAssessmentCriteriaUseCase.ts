import {
  UpdateAssessmentCriteriaDTO,
  AssessmentCriteriaResponseDTO,
} from '@/application/dto/assessments/assessmentCriteriaDtos';

export interface IUpdateAssessmentCriteriaUseCase {
  execute(id: string, dto: UpdateAssessmentCriteriaDTO): Promise<AssessmentCriteriaResponseDTO>;
}
