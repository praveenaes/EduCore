import { CreateStudentDTO, CreateStudentResponseDTO } from "../../../dto/students/studentDtos";

export interface ICreateStudent {
  execute(dto: CreateStudentDTO, photoFile?: Express.Multer.File): Promise<CreateStudentResponseDTO>;
}
