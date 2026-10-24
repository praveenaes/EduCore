import { AssessmentResultResponseDTO } from '@/application/dto/assessments/assessmentResultDtos';

export interface IGetStudentResultsUseCase {
  execute(userId: string): Promise<AssessmentResultResponseDTO[]>;
}
