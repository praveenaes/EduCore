import { TeacherAssignedSubjectDTO } from './teacherCurriculumDtos';

export { TeacherAssignedSubjectDTO };

export interface TeacherSubjectListResultDTO {
  subjects: TeacherAssignedSubjectDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
