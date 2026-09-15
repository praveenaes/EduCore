import { CreateStudentResponseDTO, UpdateStudentDTO } from "../../../dto/students/studentDtos";

export interface IUpdateStudent {
  execute(id: string, dto: UpdateStudentDTO, photoFile?: Express.Multer.File): Promise<CreateStudentResponseDTO>;
}
