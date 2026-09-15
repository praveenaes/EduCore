import { Center } from '../entities/Center';
import { IBaseRepository } from './IBaseRepository';

export interface CenterFilters {
  search?: string;
  status?: 'active' | 'inactive';
}

export interface CenterPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CenterListResult {
  centers: Center[];
  total: number;
}

export interface ICenterRepository extends IBaseRepository<Center> {
  findByCode(code: string): Promise<Center | null>;
  findByName(name: string): Promise<Center | null>;
  findByEmail(email: string): Promise<Center | null>;
  findByPhone(phone: string): Promise<Center | null>;
  findAll(filters: CenterFilters, pagination: CenterPagination): Promise<CenterListResult>;
  softDelete(id: string): Promise<boolean>;
}
