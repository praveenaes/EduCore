import { AssessmentScheduleResponseDTO, RequestDelegationDTO } from '@/application/dto/assessments/assessmentScheduleDtos';

export interface IRequestMarkEntryDelegationUseCase {
  execute(scheduleId: string, dto: RequestDelegationDTO): Promise<AssessmentScheduleResponseDTO>;
}
