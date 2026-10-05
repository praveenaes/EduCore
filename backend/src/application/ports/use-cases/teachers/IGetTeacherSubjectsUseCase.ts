import { TeacherSubjectListResultDTO } from '@/application/dto/teachers/teacherSubjectDtos';
import { TeacherBatchFilters } from '@/domain/repositories/ITeacherRepository';
import { SubjectAssignmentPagination } from '@/domain/repositories/ISubjectAssignmentRepository';

export interface IGetTeacherSubjects {
  execute(
    filters: TeacherBatchFilters,
    pagination: SubjectAssignmentPagination
  ): Promise<TeacherSubjectListResultDTO>;
}
