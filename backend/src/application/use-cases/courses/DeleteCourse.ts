import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { ISubjectAssignmentRepository } from "../../../domain/repositories/ISubjectAssignmentRepository";
import { IBatchRepository } from "../../../domain/repositories/IBatchRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IDeleteCourse } from "../../ports/use-cases/courses/IDeleteCourseUseCase";

@injectable()
export class DeleteCourse implements IDeleteCourse {
  constructor(
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository,
    @inject(TYPES.SubjectAssignmentRepository) private _subjectAssignmentRepo: ISubjectAssignmentRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository
  ) {}

  async execute(id: string): Promise<void> {
    const course = await this._courseRepo.findById(id);
    if (!course || course.isDeleted) {
      throw new NotFoundError("Course not found.");
    }

    // Check if course has active Subject Assignments or Batches
    const [assignments, batches] = await Promise.all([
      this._subjectAssignmentRepo.findByCourseId(id),
      this._batchRepo.findByCourseId(id),
    ]);

    if (batches.length > 0 || assignments.length > 0) {
      const parts: string[] = [];
      if (batches.length > 0) {
        parts.push(`${batches.length} ${batches.length === 1 ? 'batch' : 'batches'}`);
      }
      if (assignments.length > 0) {
        parts.push(`${assignments.length} subject ${assignments.length === 1 ? 'assignment' : 'assignments'}`);
      }

      throw new ValidationError(
        `Cannot delete course, it is actively assigned to ${parts.join(" and ")}`
      );
    }

    const success = await this._courseRepo.softDelete(id);
    if (!success) {
      throw new NotFoundError("Failed to delete course.");
    }
  }
}
