import { Homework, HomeworkSubmissionProps } from '../entities/Homework';
import { IBaseRepository } from './IBaseRepository';

export interface HomeworkPagination {
  page: number;
  limit: number;
}

export interface TeacherHomeworkFilters {
  teacherId: string;
  batchId?: string;
  search?: string;
}

export interface StudentHomeworkFilters {
  studentId: string;
  status?: string;
}

export interface HomeworkListResult {
  homeworks: Homework[];
  total: number;
}

export interface IHomeworkRepository extends IBaseRepository<Homework> {
  findTeacherHomeworks(
    filters: TeacherHomeworkFilters,
    pagination: HomeworkPagination
  ): Promise<HomeworkListResult>;

  findStudentHomeworks(
    filters: StudentHomeworkFilters,
    pagination: HomeworkPagination
  ): Promise<HomeworkListResult>;

  updateSubmission(
    homeworkId: string,
    studentId: string,
    submissionUpdate: Partial<HomeworkSubmissionProps>
  ): Promise<Homework | null>;

  softDelete(id: string): Promise<boolean>;
}
