import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IProgramRepository } from "../../../domain/repositories/IProgramRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IUpdateProgram } from "../../ports/use-cases/programs/IUpdateProgramUseCase";
import { UpdateProgramDTO, ProgramResponseDTO } from "../../dto/programs/programDtos";

@injectable()
export class UpdateProgram implements IUpdateProgram {
  constructor(
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(id: string, dto: UpdateProgramDTO): Promise<ProgramResponseDTO> {
    const program = await this._programRepo.findById(id);
    if (!program || program.isDeleted) {
      throw new NotFoundError("Program not found.");
    }

    const trimmedCode = dto.code.trim().toUpperCase();
    const trimmedName = dto.name.trim();

    // Check code uniqueness if code changed
    if (trimmedCode !== program.code) {
      const existingByCode = await this._programRepo.findByCode(trimmedCode);
      if (existingByCode && existingByCode.id !== id) {
        throw new ValidationError("Program with this code already exists.");
      }
    }

    // Check name uniqueness if name changed
    if (trimmedName !== program.name) {
      const existingByName = await this._programRepo.findByName(trimmedName);
      if (existingByName && existingByName.id !== id) {
        throw new ValidationError("Program with this name already exists.");
      }
    }

    program.updateDetails({
      name: trimmedName,
      code: trimmedCode,
      description: dto.description.trim(),
    });

    const updated = await this._programRepo.update(id, program);
    if (!updated) {
      throw new NotFoundError("Failed to update program.");
    }

    return {
      id: updated.id!,
      name: updated.name,
      code: updated.code,
      description: updated.description,
      isDeleted: updated.isDeleted,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
