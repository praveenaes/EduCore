import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IProgramRepository } from "../../../domain/repositories/IProgramRepository";
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IDeleteProgram } from "../../ports/use-cases/programs/IDeleteProgramUseCase";

@injectable()
export class DeleteProgram implements IDeleteProgram {
  constructor(
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository,
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository
  ) {}

  async execute(id: string): Promise<void> {
    const program = await this._programRepo.findById(id);
    if (!program || program.isDeleted) {
      throw new NotFoundError("Program not found.");
    }

    // Safety check: Cannot delete if active courses are under this program
    const activeCourses = await this._courseRepo.findByProgramId(id);
    if (activeCourses.length > 0) {
      throw new ValidationError(
        `Cannot delete program, it is actively linked to ${activeCourses.length} course${activeCourses.length === 1 ? '' : 's'}.`
      );
    }

    const success = await this._programRepo.softDelete(id);
    if (!success) {
      throw new NotFoundError("Failed to delete program.");
    }
  }
}