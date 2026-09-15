export interface IDeleteCourse {
  execute(id: string): Promise<void>;
}
