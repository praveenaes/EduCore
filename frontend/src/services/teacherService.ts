import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type { TeacherListResponse } from '../types/teacher';

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
  const res = await axiosInstance.get<ApiResponse<TeacherListResponse>>(API_ROUTES.TEACHERS.BASE, { params });
  return res.data.data;
};

export const createTeacherApi = (formData: FormData) =>
  axiosInstance.post(API_ROUTES.TEACHERS.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateTeacherApi = (id: string, formData: FormData) =>
  axiosInstance.put<{ success: boolean; data: any }>(API_ROUTES.TEACHERS.DETAIL(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTeacherApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.TEACHERS.DETAIL(id));

export const toggleTeacherStatusApi = async (id: string, isActive: boolean): Promise<void> => {
  await axiosInstance.patch(API_ROUTES.TEACHERS.STATUS(id), { isActive });
};

export const exportTeachersCsvApi = async (params?: { search?: string }): Promise<Blob> => {
  const res = await axiosInstance.get(API_ROUTES.TEACHERS.EXPORT, {
    params,
    responseType: 'blob',
  });
  return res.data as Blob;
};
