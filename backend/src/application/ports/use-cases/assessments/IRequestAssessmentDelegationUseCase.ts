import {
  AssessmentResponseDTO,
  RequestAssessmentDelegationDTO,
} from '@/application/dto/assessments/assessmentDtos';

export interface IRequestAssessmentDelegationUseCase {
  execute(
    assessmentId: string,
    dto: RequestAssessmentDelegationDTO
  ): Promise<AssessmentResponseDTO>;
}
