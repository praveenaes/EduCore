import { CourseListResultDTO } from "@/application/dto/courses/courseDtos";
import { CourseFilters, CoursePagination } from "@/domain/repositories/ICourseRepository";

export interface IGetCourses {
  execute(filters: CourseFilters, pagination: CoursePagination): Promise<CourseListResultDTO>;
}
