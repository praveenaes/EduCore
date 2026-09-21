import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type { StudentListResponse, StudentCurriculumResponse } from '../types/student';

export const getStudentCurriculumApi = () =>
  axiosInstance.get<StudentCurriculumResponse>(API_ROUTES.STUDENTS.CURRICULUM);

export const getStudentsApi = (params: { 
  page?: number; 
  limit?: number; 
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<StudentListResponse>(API_ROUTES.STUDENTS.BASE, { params });

export const createStudentApi = (formData: FormData) =>
  axiosInstance.post(API_ROUTES.STUDENTS.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const toggleStudentStatusApi = (id: string, isActive: boolean) =>
  axiosInstance.patch<{ success: boolean; message: string }>(API_ROUTES.STUDENTS.STATUS(id), { isActive });

export const updateStudentApi = (id: string, formData: FormData) =>
  axiosInstance.put(API_ROUTES.STUDENTS.DETAIL(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteStudentApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.STUDENTS.DETAIL(id));

export const exportStudentsCsvApi = (search?: string) =>
  axiosInstance.get(API_ROUTES.STUDENTS.EXPORT, {
    params: search ? { search } : {},
    responseType: 'blob',
  });
