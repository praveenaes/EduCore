export interface IDeleteHomeworkUseCase {
  execute(homeworkId: string, userId: string): Promise<void>;
}
