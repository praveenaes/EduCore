import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IProgramRepository } from "../../../domain/repositories/IProgramRepository";
import { Program } from "../../../domain/entities/Program";
import { ValidationError } from "@/shared/errors/AppError";
import { ICreateProgram } from "../../ports/use-cases/programs/ICreateProgramUseCase";
import { CreateProgramDTO, ProgramResponseDTO } from "../../dto/programs/programDtos";

@injectable()
export class CreateProgram implements ICreateProgram {
  constructor(
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(dto: CreateProgramDTO): Promise<ProgramResponseDTO> {
    const existingByCode = await this._programRepo.findByCode(dto.code);
    if (existingByCode) {
      throw new ValidationError("Program with this code already exists.");
    }

    const existingByName = await this._programRepo.findByName(dto.name);
    if (existingByName) {
      throw new ValidationError("Program with this name already exists.");
    }

    const program = Program.createNew({
      name: dto.name,
      code: dto.code,
      description: dto.description,
    });

    const saved = await this._programRepo.create(program);

    return {
      id: saved.id!,
      name: saved.name,
      code: saved.code,
      description: saved.description,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}