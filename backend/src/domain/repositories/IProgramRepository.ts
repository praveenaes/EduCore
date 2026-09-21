import { Program } from "../entities/Program";
import { IBaseRepository } from "./IBaseRepository";

export interface ProgramFilters {
  search?: string;
}

export interface ProgramPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProgramListResult {
  programs: Program[];
  total: number;
}

export interface IProgramRepository extends IBaseRepository<Program> {
  findByCode(code: string): Promise<Program | null>;
  findByName(name: string): Promise<Program | null>;
  findAll(filters: ProgramFilters, pagination: ProgramPagination): Promise<ProgramListResult>;
  softDelete(id: string): Promise<boolean>;
}