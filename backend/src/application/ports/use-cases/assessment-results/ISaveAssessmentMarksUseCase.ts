import {
  SaveAssessmentMarksDTO,
  AssessmentResultResponseDTO,
} from '@/application/dto/assessments/assessmentResultDtos';

export interface ISaveAssessmentMarksUseCase {
  execute(dto: SaveAssessmentMarksDTO): Promise<AssessmentResultResponseDTO[]>;
}
