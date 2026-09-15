import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type { CourseListResponse, CreateCoursePayload, UpdateCoursePayload } from '../types/course';

export const getCoursesApi = (params: {
  page?: number;
  limit?: number;
  search?: string;
  programId?: string;
}) =>
  axiosInstance.get<CourseListResponse>(API_ROUTES.COURSES.BASE, { params });

export const createCourseApi = (payload: CreateCoursePayload) =>
  axiosInstance.post(API_ROUTES.COURSES.BASE, payload);

export const updateCourseApi = (id: string, payload: UpdateCoursePayload) =>
  axiosInstance.put(API_ROUTES.COURSES.DETAIL(id), payload);

export const deleteCourseApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.COURSES.DETAIL(id));
