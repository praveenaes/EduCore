import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import {
  ICourseRepository,
  CourseFilters,
  CoursePagination,
} from "../../../domain/repositories/ICourseRepository";
import { IGetCourses } from "../../ports/use-cases/courses/IGetCoursesUseCase";
import { CourseListResultDTO } from "../../dto/courses/courseDtos";

@injectable()
export class GetCourses implements IGetCourses {
  constructor(
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository
  ) {}

  async execute(
    filters: CourseFilters,
    pagination: CoursePagination
  ): Promise<CourseListResultDTO> {
    const result = await this._courseRepo.findAll(filters, pagination);

    return {
      courses: result.courses.map((course) => ({
        id: course.id!,
        programId: course.programId,
        name: course.name,
        code: course.code,
        description: course.description,
        durationMonths: course.durationMonths,
        levelName: course.levelName,
        levelCount: course.levelCount,
        levels: course.levels,
        isDeleted: course.isDeleted,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      })),
      total: result.total,
    };
  }
}
