import { SubjectAssignment } from "../entities/SubjectAssignment";
import { IBaseRepository } from "./IBaseRepository";

export interface SubjectAssignmentFilters {
  search?: string;
  courseId?: string;
  levelNumber?: number;
  subjectId?: string;
  teacherId?: string;
}

export interface SubjectAssignmentPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubjectAssignmentListResult {
  assignments: SubjectAssignment[];
  total: number;
}

export interface ISubjectAssignmentRepository extends IBaseRepository<SubjectAssignment> {
  findByCourseLevelAndSubject(
    courseId: string,
    levelNumber: number,
    subjectId: string
  ): Promise<SubjectAssignment | null>;
  findByCourseId(courseId: string): Promise<SubjectAssignment[]>;
  findByTeacherId(teacherId: string): Promise<SubjectAssignment[]>;
  findBySubjectId(subjectId: string): Promise<SubjectAssignment[]>;
  findAll(
    filters: SubjectAssignmentFilters,
    pagination: SubjectAssignmentPagination
  ): Promise<SubjectAssignmentListResult>;
  softDelete(id: string): Promise<boolean>;
}
