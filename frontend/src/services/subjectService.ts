import { API_ROUTES } from "../api/apiRoutes";
import axiosInstance from "../api/axiosInstance";
import type { CreateSubjectPayload, SubjectListResponse, UpdateSubjectPayload } from "../types/subject";

export const getSubjectsApi = (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<SubjectListResponse>(API_ROUTES.SUBJECTS.BASE, { params });

export const createSubjectApi = (payload: CreateSubjectPayload) =>
  axiosInstance.post(API_ROUTES.SUBJECTS.BASE, payload);

export const updateSubjectApi = (id: string, payload: UpdateSubjectPayload) =>
  axiosInstance.put(API_ROUTES.SUBJECTS.DETAIL(id), payload);

export const deleteSubjectApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.SUBJECTS.DETAIL(id));
