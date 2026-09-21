import { Student } from "../entities/Student";
import { IBaseRepository } from "./IBaseRepository";

export interface StudentFilters {
  search?: string;
}

export interface StudentPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentListResult {
  students: Student[];
  total: number;
}

export interface IStudentRepository extends IBaseRepository<Student> {
  findByUserId(userId: string): Promise<Student | null>;
  findByAdmissionNumber(admissionNumber: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findByNationalId(nationalId: string): Promise<Student | null>;
  findByName(firstName: string, lastName: string): Promise<Student | null>;
  findAll(filters: StudentFilters, pagination: StudentPagination): Promise<StudentListResult>;
  updateStatus(id: string, isActive: boolean): Promise<Student | null>;
  exportAll(filters: StudentFilters): Promise<Student[]>;
  softDelete(id: string): Promise<boolean>;
}
