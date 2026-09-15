import { Teacher } from "../../../../domain/entities/Teacher";
import { CreateTeacherDTO } from "@/application/dto/teachers/teacherDtos";

export interface ICreateTeacher {
  execute(dto: CreateTeacherDTO, photoFile?: Express.Multer.File): Promise<Teacher>;
}
