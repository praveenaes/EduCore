import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  AssessmentCriteriaListResponse,
  CreateAssessmentCriteriaPayload,
  UpdateAssessmentCriteriaPayload,
} from '../types/assessmentCriteria';

export const getAssessmentCriteriaApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  levelNumber?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<AssessmentCriteriaListResponse>(API_ROUTES.ASSESSMENT_CRITERIA.BASE, { params });

export const createAssessmentCriteriaApi = (payload: CreateAssessmentCriteriaPayload) =>
  axiosInstance.post(API_ROUTES.ASSESSMENT_CRITERIA.BASE, payload);

export const updateAssessmentCriteriaApi = (id: string, payload: UpdateAssessmentCriteriaPayload) =>
  axiosInstance.put(API_ROUTES.ASSESSMENT_CRITERIA.DETAIL(id), payload);

export const deleteAssessmentCriteriaApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.ASSESSMENT_CRITERIA.DETAIL(id));
