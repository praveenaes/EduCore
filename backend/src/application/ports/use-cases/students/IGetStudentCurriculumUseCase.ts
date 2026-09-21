import { StudentAcademicCurriculumDTO } from "../../../dto/students/studentCurriculumDtos";

export interface IGetStudentCurriculum {
  execute(userId: string): Promise<StudentAcademicCurriculumDTO>;
}
