export interface IDeleteAssessmentUseCase {
  execute(id: string): Promise<void>;
}
