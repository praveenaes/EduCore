import {
  AssessmentResultQueryDTO,
  AssessmentResultListResultDTO,
} from '@/application/dto/assessments/assessmentResultDtos';

export interface IGetAssessmentResultsUseCase {
  execute(query: AssessmentResultQueryDTO): Promise<AssessmentResultListResultDTO>;
}
