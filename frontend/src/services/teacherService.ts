import axiosInstance from '../api/axiosInstance';
import type { TeacherListResponse } from '../types/teacher';

const BASE = '/teachers';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getTeachersApi = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<TeacherListResponse> => {
  const res = await axiosInstance.get<ApiResponse<TeacherListResponse>>(BASE, { params });
  return res.data.data;
};

export const createTeacherApi = (formData: FormData) =>
  axiosInstance.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateTeacherApi = (id: string, formData: FormData) =>
  axiosInstance.put<{ success: boolean; data: any }>(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTeacherApi = (id: string) =>
  axiosInstance.delete(`${BASE}/${id}`);

export const toggleTeacherStatusApi = async (id: string, isActive: boolean): Promise<void> => {
  await axiosInstance.patch(`${BASE}/${id}/status`, { isActive });
};

export const exportTeachersCsvApi = async (params?: { search?: string }): Promise<Blob> => {
  const res = await axiosInstance.get(`${BASE}/export/csv`, {
    params,
    responseType: 'blob',
  });
  return res.data as Blob;
};
