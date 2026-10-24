import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  TeacherHomeworkListResponse,
  HomeworkSubmissionsResponse,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  ReviewSubmissionPayload,
  StudentHomeworkListResponse,
  SubmitHomeworkPayload,
  RequestHomeworkExtensionPayload,
  ReviewHomeworkExtensionPayload,
} from '../types/homework';

// ==============================
// Teacher Portal APIs
// ==============================

export const getTeacherHomeworksApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  batchId?: string;
  subjectId?: string;
}) =>
  axiosInstance.get<TeacherHomeworkListResponse>(API_ROUTES.HOMEWORK.BASE, {
    params,
  });

export const createHomeworkApi = (payload: CreateHomeworkPayload) =>
  axiosInstance.post(API_ROUTES.HOMEWORK.BASE, payload);

export const updateHomeworkApi = (id: string, payload: UpdateHomeworkPayload) =>
  axiosInstance.put(API_ROUTES.HOMEWORK.DETAIL(id), payload);

export const deleteHomeworkApi = (id: string) =>
  axiosInstance.delete(API_ROUTES.HOMEWORK.DETAIL(id));

export const getHomeworkSubmissionsApi = (homeworkId: string) =>
  axiosInstance.get<HomeworkSubmissionsResponse>(
    API_ROUTES.HOMEWORK.SUBMISSIONS(homeworkId)
  );

export const reviewSubmissionApi = (
  homeworkId: string,
  participantId: string,
  payload: ReviewSubmissionPayload
) =>
  axiosInstance.post(
    API_ROUTES.HOMEWORK.REVIEW(homeworkId),
    { participantId, ...payload }
  );

// ==============================
// Student Portal APIs
// ==============================

export const getStudentHomeworksApi = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  subjectId?: string;
}) =>
  axiosInstance.get<StudentHomeworkListResponse>(API_ROUTES.HOMEWORK.STUDENT, {
    params,
  });

export const submitHomeworkApi = (
  participantId: string,
  payload: SubmitHomeworkPayload
) =>
  axiosInstance.post(
    API_ROUTES.HOMEWORK.STUDENT_SUBMIT(participantId),
    payload
  );

export const requestHomeworkExtensionApi = (
  homeworkId: string,
  payload: RequestHomeworkExtensionPayload
) =>
  axiosInstance.post(
    API_ROUTES.HOMEWORK.STUDENT_EXTENSION(homeworkId),
    payload
  );

export const reviewHomeworkExtensionApi = (
  homeworkId: string,
  studentId: string,
  payload: ReviewHomeworkExtensionPayload
) =>
  axiosInstance.patch(
    API_ROUTES.HOMEWORK.REVIEW_EXTENSION(homeworkId, studentId),
    payload
  );
