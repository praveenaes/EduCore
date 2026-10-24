export interface IDeleteAssessmentCriteriaUseCase {
  execute(id: string): Promise<void>;
}
