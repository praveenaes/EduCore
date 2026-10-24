import { UpdateAssessmentDTO, AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';

export interface IUpdateAssessmentUseCase {
  execute(id: string, dto: UpdateAssessmentDTO): Promise<AssessmentResponseDTO>;
}
