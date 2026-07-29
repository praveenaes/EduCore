import { CreateStudentResponseDTO } from "../../../dto/students/studentDtos";

export interface ICreateStudent {
  execute(dto: any, photoFile?: Express.Multer.File): Promise<CreateStudentResponseDTO>;
}
