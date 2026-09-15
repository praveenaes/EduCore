import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { NotFoundError } from "@/shared/errors/AppError";
import { IDeleteCourse } from "../../ports/use-cases/courses/IDeleteCourseUseCase";

@injectable()
export class DeleteCourse implements IDeleteCourse {
  constructor(
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository
  ) {}

  async execute(id: string): Promise<void> {
    const course = await this._courseRepo.findById(id);
    if (!course || course.isDeleted) {
      throw new NotFoundError("Course not found.");
    }

    const success = await this._courseRepo.softDelete(id);
    if (!success) {
      throw new NotFoundError("Failed to delete course.");
    }
  }
}
