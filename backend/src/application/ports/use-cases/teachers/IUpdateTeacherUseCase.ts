import { TeacherResponseDTO, UpdateTeacherDTO } from "@/application/dto/teachers/teacherDtos";

export interface IUpdateTeacher {
  execute(id: string, dto: UpdateTeacherDTO, photoFile?: Express.Multer.File): Promise<TeacherResponseDTO>;
}
