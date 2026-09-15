import { API_ROUTES } from "../api/apiRoutes";
import axiosInstance from "../api/axiosInstance";
import type {
  CreateCenterPayload,
  CenterListResponse,
  UpdateCenterPayload,
} from "../types/center";

export const getCentersApi = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<CenterListResponse>(API_ROUTES.CENTERS.BASE, { params });

export const createCenterApi = (payload: CreateCenterPayload) =>
  axiosInstance.post(API_ROUTES.CENTERS.BASE, payload);

export const updateCenterApi = (id: string, payload: UpdateCenterPayload) =>
  axiosInstance.put(API_ROUTES.CENTERS.DETAIL(id), payload);

export const deleteCenterApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.CENTERS.DETAIL(id));
