import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  NotificationRecipientListResponse,
  UnreadCountResponse,
  CreateNotificationPayload,
} from '../types/notification';

export const getMyNotificationsApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get<NotificationRecipientListResponse>(API_ROUTES.NOTIFICATIONS.BASE, {
    params,
  });

export const getUnreadCountApi = () =>
  axiosInstance.get<UnreadCountResponse>(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT);

export const markNotificationAsReadApi = (id: string) =>
  axiosInstance.patch(API_ROUTES.NOTIFICATIONS.MARK_READ(id));

export const markAllNotificationsAsReadApi = () =>
  axiosInstance.patch(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ);

export const createNotificationApi = (payload: CreateNotificationPayload) =>
  axiosInstance.post(API_ROUTES.NOTIFICATIONS.BASE, payload);

export const getSentNotificationsApi = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) =>
  axiosInstance.get(API_ROUTES.NOTIFICATIONS.SENT, {
    params,
  });
