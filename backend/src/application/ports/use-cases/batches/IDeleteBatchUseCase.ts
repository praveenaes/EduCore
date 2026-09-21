export interface IDeleteBatchUseCase {
  execute(id: string): Promise<void>;
}
