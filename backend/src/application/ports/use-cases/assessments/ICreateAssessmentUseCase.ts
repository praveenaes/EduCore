import { CreateAssessmentDTO, AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';

export interface ICreateAssessmentUseCase {
  execute(dto: CreateAssessmentDTO): Promise<AssessmentResponseDTO>;
}
