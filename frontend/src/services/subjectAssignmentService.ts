import { API_ROUTES } from "../api/apiRoutes";
import axiosInstance from "../api/axiosInstance";
import type {
  CreateSubjectAssignmentPayload,
  UpdateSubjectAssignmentPayload,
  SubjectAssignmentListResponse,
} from "../types/subjectAssignment";

export const getSubjectAssignmentsApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  levelNumber?: number;
  subjectId?: string;
  teacherId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<SubjectAssignmentListResponse>(API_ROUTES.SUBJECT_ASSIGNMENTS.BASE, { params });

export const createSubjectAssignmentApi = (payload: CreateSubjectAssignmentPayload) =>
  axiosInstance.post(API_ROUTES.SUBJECT_ASSIGNMENTS.BASE, payload);

export const updateSubjectAssignmentApi = (id: string, payload: UpdateSubjectAssignmentPayload) =>
  axiosInstance.put(API_ROUTES.SUBJECT_ASSIGNMENTS.DETAIL(id), payload);

export const deleteSubjectAssignmentApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.SUBJECT_ASSIGNMENTS.DETAIL(id));
