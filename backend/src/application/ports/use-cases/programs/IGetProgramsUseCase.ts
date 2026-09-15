import { ProgramListResultDTO } from "@/application/dto/programs/programDtos";
import { ProgramFilters, ProgramPagination } from "@/domain/repositories/IProgramRepository";

export interface IGetPrograms {
  execute(filters: ProgramFilters, pagination: ProgramPagination): Promise<ProgramListResultDTO>;
}