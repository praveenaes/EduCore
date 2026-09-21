import { TeacherFilters, TeacherPagination } from "@/domain/repositories/ITeacherRepository";
import { TeacherListResultDTO } from "../../../dto/teachers/teacherDtos";

export interface IGetTeachers {
  execute(filters: TeacherFilters, pagination: TeacherPagination): Promise<TeacherListResultDTO>;
}
