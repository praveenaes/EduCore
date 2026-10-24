import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  ApplyLeavePayload,
  UpdateLeavePayload,
  RescheduleLeavePayload,
  StudentLeaveListResponse,
  ReviewLeavePayload,
  BatchLeaveListResponse,
} from '../types/leave';

// ==============================
// Student Portal APIs
// ==============================

export const getStudentLeavesApi = () =>
  axiosInstance.get<StudentLeaveListResponse>(API_ROUTES.LEAVES.STUDENT);

export const applyStudentLeaveApi = (payload: ApplyLeavePayload) =>
  axiosInstance.post(API_ROUTES.LEAVES.STUDENT, payload);

export const updateStudentLeaveApi = (id: string, payload: UpdateLeavePayload) =>
  axiosInstance.put(API_ROUTES.LEAVES.STUDENT_DETAIL(id), payload);

export const rescheduleStudentLeaveApi = (id: string, payload: RescheduleLeavePayload) =>
  axiosInstance.post(API_ROUTES.LEAVES.STUDENT_RESCHEDULE(id), payload);

export const cancelStudentLeaveApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.LEAVES.STUDENT_DETAIL(id));

// ==============================
// Teacher Portal APIs
// ==============================


export const getBatchLeavesApi = (batchId: string, status?: string) =>
  axiosInstance.get<BatchLeaveListResponse>(API_ROUTES.LEAVES.BATCH(batchId), {
    params: status ? { status } : undefined,
  });


export const reviewStudentLeaveApi = (id: string, payload: ReviewLeavePayload) =>
  axiosInstance.patch(API_ROUTES.LEAVES.REVIEW(id), payload);
