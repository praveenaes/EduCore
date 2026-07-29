import { Teacher } from "../../../../domain/entities/Teacher";

export interface IUpdateTeacher {
  execute(id: string, dto: any, photoFile?: Express.Multer.File): Promise<Teacher>;
}
