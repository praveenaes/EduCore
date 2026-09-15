export interface IDeleteAcademicYearUseCase {
  execute(id: string): Promise<void>;
}
