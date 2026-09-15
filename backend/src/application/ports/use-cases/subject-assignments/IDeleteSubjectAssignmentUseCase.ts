export interface IDeleteSubjectAssignmentUseCase {
  execute(id: string): Promise<boolean>;
}
