import { AssessmentScheduleResponseDTO, ReviewDelegationDTO } from '@/application/dto/assessments/assessmentScheduleDtos';

export interface IReviewMarkEntryDelegationUseCase {
  execute(scheduleId: string, dto: ReviewDelegationDTO): Promise<AssessmentScheduleResponseDTO>;
}
