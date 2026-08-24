import { Teacher } from "../entities/Teacher";

export interface TeacherFilters {
  search?: string;
}

export interface TeacherPagination {
  page: number;
  limit: number;
}

export interface TeacherListResult {
  teachers: Teacher[];
  total: number;
}

export interface ITeacherRepository {
  create(teacher: Teacher): Promise<Teacher>;
  findById(id: string): Promise<Teacher | null>;
  findByEmployeeId(employeeId: string): Promise<Teacher | null>;
  findByEmail(email: string): Promise<Teacher | null>;
  findByNationalId(nationalId: string): Promise<Teacher | null>;
  findByName(firstName: string, lastName: string): Promise<Teacher | null>;
  findAll(filters: TeacherFilters, pagination: TeacherPagination): Promise<TeacherListResult>;
  update(id: string, teacher: Partial<Teacher>): Promise<Teacher | null>;
  updateStatus(id: string, isActive: boolean): Promise<Teacher | null>;
  softDelete(id: string): Promise<boolean>;
  exportAll(filters: TeacherFilters): Promise<Teacher[]>;
}
