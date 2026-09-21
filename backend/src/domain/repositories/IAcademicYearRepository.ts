import { AcademicYear } from "../entities/AcademicYear";
import { IBaseRepository } from "./IBaseRepository";

export interface AcademicYearFilters {
  search?: string;
  centerId?: string;
  current?: boolean;
}

export interface AcademicYearPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AcademicYearListResult {
  academicYears: AcademicYear[];
  total: number;
}

export interface IAcademicYearRepository extends IBaseRepository<AcademicYear> {
  findByCode(code: string): Promise<AcademicYear | null>;
  findByName(name: string): Promise<AcademicYear | null>;
  findAll(filters: AcademicYearFilters, pagination: AcademicYearPagination): Promise<AcademicYearListResult>;
  findByCenterId(centerId: string): Promise<AcademicYear[]>;
  unsetCurrent(): Promise<void>;
  softDelete(id: string): Promise<boolean>;
}
