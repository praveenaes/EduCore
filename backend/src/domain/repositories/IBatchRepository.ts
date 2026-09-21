import { Batch } from '../entities/Batch';
import { IBaseRepository } from './IBaseRepository';

export interface BatchFilters {
  search?: string;
  courseId?: string;
  levelNumber?: number;
  centerId?: string;
  academicYearId?: string;
  isActive?: boolean;
}

export interface BatchPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BatchListResult {
  batches: Batch[];
  total: number;
}

export interface IBatchRepository extends IBaseRepository<Batch> {
  findByName(
    name: string,
    courseId: string,
    levelNumber: number,
    centerId: string,
    academicYearId: string
  ): Promise<Batch | null>;
  findByCourseId(courseId: string): Promise<Batch[]>;
  findByCenterId(centerId: string): Promise<Batch[]>;
  findByTeacherId(teacherId: string): Promise<Batch[]>;
  findAll(filters: BatchFilters, pagination: BatchPagination): Promise<BatchListResult>;
  softDelete(id: string): Promise<boolean>;
}
