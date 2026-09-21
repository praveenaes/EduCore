import { CreateTeacherDTO, TeacherResponseDTO } from "@/application/dto/teachers/teacherDtos";

export interface ICreateTeacher {
  execute(dto: CreateTeacherDTO, photoFile?: Express.Multer.File): Promise<TeacherResponseDTO>;
}
