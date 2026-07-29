export interface IDeleteTeacher {
  execute(id: string): Promise<void>;
}
