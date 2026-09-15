export interface IDeleteProgram {
  execute(id: string): Promise<void>;
}