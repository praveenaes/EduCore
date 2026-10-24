import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  AssessmentScheduleListResponse,
  CreateAssessmentSchedulePayload,
  UpdateAssessmentSchedulePayload,
} from '../types/assessmentSchedule';

export const getAssessmentSchedulesApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  assessmentId?: string;
  courseId?: string;
  levelNumber?: number;
  batchId?: string;
  centerId?: string;
  isCompleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<AssessmentScheduleListResponse>(API_ROUTES.ASSESSMENT_SCHEDULES.BASE, { params });

export const createAssessmentScheduleApi = (payload: CreateAssessmentSchedulePayload) =>
  axiosInstance.post(API_ROUTES.ASSESSMENT_SCHEDULES.BASE, payload);

export const updateAssessmentScheduleApi = (id: string, payload: UpdateAssessmentSchedulePayload) =>
  axiosInstance.put(API_ROUTES.ASSESSMENT_SCHEDULES.DETAIL(id), payload);

export const deleteAssessmentScheduleApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.ASSESSMENT_SCHEDULES.DETAIL(id));

export const toggleAssessmentScheduleStatusApi = (id: string) =>
  axiosInstance.patch(API_ROUTES.ASSESSMENT_SCHEDULES.TOGGLE_STATUS(id));
