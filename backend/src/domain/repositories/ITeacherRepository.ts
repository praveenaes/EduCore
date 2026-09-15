import { Teacher } from "../entities/Teacher";
import { IBaseRepository } from "./IBaseRepository";

export interface TeacherFilters {
  search?: string;
}

export interface TeacherPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TeacherListResult {
  teachers: Teacher[];
  total: number;
}

export interface ITeacherRepository extends IBaseRepository<Teacher> {
  findByEmployeeId(employeeId: string): Promise<Teacher | null>;
  findByEmail(email: string): Promise<Teacher | null>;
  findByNationalId(nationalId: string): Promise<Teacher | null>;
  findByName(firstName: string, lastName: string): Promise<Teacher | null>;
  findAll(filters: TeacherFilters, pagination: TeacherPagination): Promise<TeacherListResult>;
  updateStatus(id: string, isActive: boolean): Promise<Teacher | null>;
  softDelete(id: string): Promise<boolean>;
  exportAll(filters: TeacherFilters): Promise<Teacher[]>;
}
