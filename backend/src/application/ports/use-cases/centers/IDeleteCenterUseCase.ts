export interface IDeleteCenterUseCase {
  execute(id: string): Promise<boolean>;
}
