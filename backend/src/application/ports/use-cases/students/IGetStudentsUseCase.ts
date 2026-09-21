import { StudentFilters, StudentPagination } from "@/domain/repositories/IStudentRepository";
import { StudentListResultDTO } from "../../../dto/students/studentDtos";

export interface IGetStudents {
  execute(filters: StudentFilters, pagination: StudentPagination): Promise<StudentListResultDTO>;
}
