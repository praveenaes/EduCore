import { Teacher } from "../../../../domain/entities/Teacher";

export interface ICreateTeacher {
  execute(dto: any, photoFile?: Express.Multer.File): Promise<Teacher>;
}
