import {
  AssessmentResponseDTO,
  ReviewAssessmentDelegationDTO,
} from '@/application/dto/assessments/assessmentDtos';

export interface IReviewAssessmentDelegationUseCase {
  execute(
    assessmentId: string,
    dto: ReviewAssessmentDelegationDTO
  ): Promise<AssessmentResponseDTO>;
}
