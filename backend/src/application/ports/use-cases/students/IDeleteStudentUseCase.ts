export interface IDeleteStudent {
  execute(id: string): Promise<void>;
}
