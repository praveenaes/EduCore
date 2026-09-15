import { Course } from "../entities/Course";
import { IBaseRepository } from "./IBaseRepository";

export interface CourseFilters {
  search?: string;
  programId?: string;
}

export interface CoursePagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CourseListResult {
  courses: Course[];
  total: number;
}

export interface ICourseRepository extends IBaseRepository<Course> {
  findByCode(code: string): Promise<Course | null>;
  findByName(name: string): Promise<Course | null>;
  findByProgramId(programId: string): Promise<Course[]>;
  findAll(filters: CourseFilters, pagination: CoursePagination): Promise<CourseListResult>;
  softDelete(id: string): Promise<boolean>;
}
