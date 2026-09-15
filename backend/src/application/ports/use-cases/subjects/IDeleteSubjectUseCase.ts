export interface IDeleteSubject {
  execute(id: string): Promise<void>;
}
