import { Student } from "../../../../domain/entities/Student";

export interface IUpdateStudent {
  execute(id: string, dto: any, photoFile?: Express.Multer.File): Promise<Student>;
}
