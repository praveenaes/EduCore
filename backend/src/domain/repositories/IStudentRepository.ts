import { Student } from "../entities/Student";

export interface StudentFilters {
  search?: string;
  isActive?: boolean;
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

export interface IStudentRepository {
  create(student: Student): Promise<Student>;
  findByAdmissionNumber(admissionNumber: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findByNationalId(nationalId: string): Promise<Student | null>;
  findByName(firstName: string, lastName: string): Promise<Student | null>;
  findAll(filters: StudentFilters, pagination: StudentPagination): Promise<StudentListResult>;
  updateStatus(id: string, isActive: boolean): Promise<Student | null>;
  exportAll(filters: StudentFilters): Promise<Student[]>;
  findById(id: string): Promise<Student | null>;
  update(id: string, student: Partial<Student>): Promise<Student | null>;
  softDelete(id: string): Promise<boolean>;
}
