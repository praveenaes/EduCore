import {
  AssessmentScheduleQueryDTO,
  AssessmentScheduleListResultDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';

export interface IGetAssessmentSchedulesUseCase {
  execute(query: AssessmentScheduleQueryDTO): Promise<AssessmentScheduleListResultDTO>;
}
