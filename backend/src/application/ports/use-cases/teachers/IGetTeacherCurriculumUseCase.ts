import { TeacherAcademicCurriculumDTO } from "../../../dto/teachers/teacherCurriculumDtos";

export interface IGetTeacherCurriculum {
  execute(userId: string): Promise<TeacherAcademicCurriculumDTO>;
}
