import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  BatchListResponse,
  CreateBatchPayload,
  UpdateBatchPayload,
} from '../types/batch';

export const getBatchesApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  levelNumber?: number;
  centerId?: string;
  academicYearId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => axiosInstance.get<BatchListResponse>(API_ROUTES.BATCHES.BASE, { params });

export const createBatchApi = (payload: CreateBatchPayload) =>
  axiosInstance.post(API_ROUTES.BATCHES.BASE, payload);

export const updateBatchApi = (id: string, payload: UpdateBatchPayload) =>
  axiosInstance.put(API_ROUTES.BATCHES.DETAIL(id), payload);

export const deleteBatchApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.BATCHES.DETAIL(id));
