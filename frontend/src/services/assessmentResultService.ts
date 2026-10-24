import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  AssessmentResult,
  MarkEntrySheetData,
  SaveMarksPayload,
  PublishResultsPayload,
  StudentReportCardData,
} from '../types/assessmentResult';

export const getMarkEntrySheetApi = (scheduleId: string) =>
  axiosInstance.get<{ success: boolean; data: MarkEntrySheetData }>(
    API_ROUTES.ASSESSMENT_RESULTS.SHEET(scheduleId)
  );

export const saveAssessmentMarksApi = (payload: SaveMarksPayload) =>
  axiosInstance.post<{ success: boolean; message: string; data: AssessmentResult[] }>(
    API_ROUTES.ASSESSMENT_RESULTS.BASE,
    payload
  );

export const publishAssessmentResultsApi = (payload: PublishResultsPayload) =>
  axiosInstance.post<{ success: boolean; message: string }>(
    API_ROUTES.ASSESSMENT_RESULTS.PUBLISH,
    payload
  );

export const getAssessmentResultsApi = (params?: {
  scheduleId?: string;
  assessmentId?: string;
  studentId?: string;
  batchId?: string;
  criteriaId?: string;
}) =>
  axiosInstance.get<{ success: boolean; data: AssessmentResult[] }>(
    API_ROUTES.ASSESSMENT_RESULTS.BASE,
    { params }
  );

export const getMyResultsApi = () =>
  axiosInstance.get<{ success: boolean; data: AssessmentResult[] }>(
    API_ROUTES.ASSESSMENT_RESULTS.MY_RESULTS
  );

export const getMyReportCardApi = (assessmentId: string) =>
  axiosInstance.get<{ success: boolean; data: StudentReportCardData }>(
    API_ROUTES.ASSESSMENT_RESULTS.MY_REPORT_CARD(assessmentId)
  );

export const getStudentReportCardApi = (assessmentId: string, studentId: string) =>
  axiosInstance.get<{ success: boolean; data: StudentReportCardData }>(
    API_ROUTES.ASSESSMENT_RESULTS.STUDENT_REPORT_CARD(assessmentId, studentId)
  );
