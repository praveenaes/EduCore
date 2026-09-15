import { API_ROUTES } from "../api/apiRoutes";
import axiosInstance from "../api/axiosInstance";
import type {
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
  AcademicYearListResponse,
} from "../types/academicYear";

export const getAcademicYearsApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
  current?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<AcademicYearListResponse>(API_ROUTES.ACADEMIC_YEARS.BASE, { params });

export const createAcademicYearApi = (payload: CreateAcademicYearPayload) =>
  axiosInstance.post(API_ROUTES.ACADEMIC_YEARS.BASE, payload);

export const updateAcademicYearApi = (id: string, payload: UpdateAcademicYearPayload) =>
  axiosInstance.put(API_ROUTES.ACADEMIC_YEARS.DETAIL(id), payload);

export const deleteAcademicYearApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.ACADEMIC_YEARS.DETAIL(id));
