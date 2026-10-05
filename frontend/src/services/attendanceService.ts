import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  BatchAttendanceResponse,
  CreateAttendancePayload,
  UpdateAttendancePayload,
  StudentMonthlyAttendanceResponse,
} from '../types/attendance';

//teacher portal
export const getBatchAttendanceApi = (params: {
  batchId: string;
  date: string; 
}) =>
  axiosInstance.get<BatchAttendanceResponse>(API_ROUTES.ATTENDANCE.STUDENTS, {
    params,
  });

export const createBatchAttendanceApi = (payload: CreateAttendancePayload) =>
  axiosInstance.post(API_ROUTES.ATTENDANCE.STUDENTS, payload);

export const updateBatchAttendanceApi = (payload: UpdateAttendancePayload) =>
  axiosInstance.put(API_ROUTES.ATTENDANCE.STUDENTS, payload);



//student portal
export const getStudentAttendanceApi = (params: {
  month: number;
  year: number;
}) =>
  axiosInstance.get<StudentMonthlyAttendanceResponse>(
    API_ROUTES.ATTENDANCE.STUDENT,
    { params }
  );