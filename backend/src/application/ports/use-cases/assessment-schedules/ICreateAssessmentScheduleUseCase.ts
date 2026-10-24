import {
  CreateAssessmentScheduleDTO,
  AssessmentScheduleResponseDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';

export interface ICreateAssessmentScheduleUseCase {
  execute(dto: CreateAssessmentScheduleDTO): Promise<AssessmentScheduleResponseDTO>;
}
