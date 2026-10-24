export interface IDeleteAssessmentScheduleUseCase {
  execute(id: string): Promise<void>;
}
