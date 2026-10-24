import { AssessmentScheduleResponseDTO } from '@/application/dto/assessments/assessmentScheduleDtos';

export interface IToggleAssessmentScheduleStatusUseCase {
  execute(id: string): Promise<AssessmentScheduleResponseDTO>;
}
