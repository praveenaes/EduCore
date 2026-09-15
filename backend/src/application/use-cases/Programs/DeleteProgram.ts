import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IProgramRepository } from "../../../domain/repositories/IProgramRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IDeleteProgram } from "../../ports/use-cases/programs/IDeleteProgramUseCase";

@injectable()
export class DeleteProgram implements IDeleteProgram {
  constructor(
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(id: string): Promise<void> {
    const program = await this._programRepo.findById(id);
    if (!program || program.isDeleted) {
      throw new NotFoundError("Program not found.");
    }

    // Safety check: Cannot delete if active courses are under this program
    const hasCourses = await this._programRepo.hasActiveCourses(id);
    if (hasCourses) {
      throw new ValidationError(
        "Cannot delete program: active courses are currently linked to this program. Please remove or reassign the courses first."
      );
    }

    const success = await this._programRepo.softDelete(id);
    if (!success) {
      throw new NotFoundError("Failed to delete program.");
    }
  }
}