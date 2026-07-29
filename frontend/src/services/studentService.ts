import axiosInstance from '../api/axiosInstance';
import type { StudentListResponse } from '../types/student';

const BASE = '/students';

export const getStudentsApi = (params: { page?: number; limit?: number; search?: string }) =>
  axiosInstance.get<StudentListResponse>(BASE, { params });

export const createStudentApi = (formData: FormData) =>
  axiosInstance.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const toggleStudentStatusApi = (id: string, isActive: boolean) =>
  axiosInstance.patch<{ success: boolean; message: string }>(`${BASE}/${id}/status`, { isActive });

export const updateStudentApi = (id: string, formData: FormData) =>
  axiosInstance.put(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteStudentApi = (id: string) =>
  axiosInstance.delete(`${BASE}/${id}`);

export const exportStudentsCsvApi = (search?: string) =>
  axiosInstance.get(`${BASE}/export/csv`, {
    params: search ? { search } : {},
    responseType: 'blob',
  });
