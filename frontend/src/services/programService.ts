import { API_ROUTES } from "../api/apiRoutes";
import axiosInstance from "../api/axiosInstance";
import type { CreateProgramPayload, ProgramListResponse, UpdateProgramPayload } from "../types/program";

export const getProgramsApi = (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<ProgramListResponse>(API_ROUTES.PROGRAMS.BASE, { params });
export const createProgramApi = (payload: CreateProgramPayload) =>
  axiosInstance.post(API_ROUTES.PROGRAMS.BASE, payload);
export const updateProgramApi = (id: string, payload: UpdateProgramPayload) =>
  axiosInstance.put(API_ROUTES.PROGRAMS.DETAIL(id), payload);
export const deleteProgramApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.PROGRAMS.DETAIL(id));