import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import {
  IProgramRepository,
  ProgramFilters,
  ProgramPagination,
} from "../../../domain/repositories/IProgramRepository";
import { IGetPrograms } from "../../ports/use-cases/programs/IGetProgramsUseCase";
import { ProgramListResultDTO } from "../../dto/programs/programDtos";

@injectable()
export class GetPrograms implements IGetPrograms {
  constructor(
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(
    filters: ProgramFilters,
    pagination: ProgramPagination
  ): Promise<ProgramListResultDTO> {
    const result = await this._programRepo.findAll(filters, pagination);

    return {
      programs: result.programs.map((program) => ({
        id: program.id!,
        name: program.name,
        code: program.code,
        description: program.description,
        isDeleted: program.isDeleted,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
      })),
      total: result.total,
    };
  }
}