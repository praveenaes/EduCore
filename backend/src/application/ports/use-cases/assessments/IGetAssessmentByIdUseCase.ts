import { AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';

export interface IGetAssessmentByIdUseCase {
  execute(id: string): Promise<AssessmentResponseDTO>;
}
