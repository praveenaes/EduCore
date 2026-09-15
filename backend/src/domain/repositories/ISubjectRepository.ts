import { Subject } from "../entities/Subject";
import { IBaseRepository } from "./IBaseRepository";

export interface SubjectFilters {
  search?: string;
}

export interface SubjectPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubjectListResult {
  subjects: Subject[];
  total: number;
}

export interface ISubjectRepository extends IBaseRepository<Subject> {
  findByCode(code: string): Promise<Subject | null>;
  findByName(name: string): Promise<Subject | null>;
  findAll(filters: SubjectFilters, pagination: SubjectPagination): Promise<SubjectListResult>;
  softDelete(id: string): Promise<boolean>;
}
