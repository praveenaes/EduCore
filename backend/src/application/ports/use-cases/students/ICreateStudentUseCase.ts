import { CreateStudentDTO, StudentResponseDTO } from "../../../dto/students/studentDtos";

export interface ICreateStudent {
  execute(dto: CreateStudentDTO, photoFile?: Express.Multer.File): Promise<StudentResponseDTO>;
}
