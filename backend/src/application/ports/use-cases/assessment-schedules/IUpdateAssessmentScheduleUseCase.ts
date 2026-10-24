import {
  UpdateAssessmentScheduleDTO,
  AssessmentScheduleResponseDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';

export interface IUpdateAssessmentScheduleUseCase {
  execute(id: string, dto: UpdateAssessmentScheduleDTO): Promise<AssessmentScheduleResponseDTO>;
}
