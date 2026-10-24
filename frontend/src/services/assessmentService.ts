import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  AssessmentListResponse,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from '../types/assessment';

export const getAssessmentsApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  academicYearId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => axiosInstance.get<AssessmentListResponse>(API_ROUTES.ASSESSMENTS.BASE, { params });

export const createAssessmentApi = (payload: CreateAssessmentPayload) =>
  axiosInstance.post(API_ROUTES.ASSESSMENTS.BASE, payload);

export const updateAssessmentApi = (id: string, payload: UpdateAssessmentPayload) =>
  axiosInstance.put(API_ROUTES.ASSESSMENTS.DETAIL(id), payload);

export const deleteAssessmentApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.ASSESSMENTS.DETAIL(id));
