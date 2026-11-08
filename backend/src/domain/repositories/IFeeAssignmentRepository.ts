import { FeeAssignment } from '../entities/FeeAssignment';
import { IBaseRepository } from './IBaseRepository';

export interface FeeAssignmentFilters {
  studentId?: string;
  userId?: string;
  status?: string;
  search?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface FeeAssignmentPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FeeAssignmentListResult {
  feeAssignments: FeeAssignment[];
  total: number;
}

export interface IFeeAssignmentRepository extends IBaseRepository<FeeAssignment> {
  createBulk(entities: FeeAssignment[]): Promise<FeeAssignment[]>;
  findAll(
    filters: FeeAssignmentFilters,
    pagination: FeeAssignmentPagination
  ): Promise<FeeAssignmentListResult>;
  findByStudentId(studentId: string): Promise<FeeAssignment[]>;
  softDelete(id: string): Promise<boolean>;
}
