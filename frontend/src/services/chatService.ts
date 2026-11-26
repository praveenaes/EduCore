import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/apiRoutes';
import type {
  ChatGroup,
  ChatMessage,
  CreateGroupPayload,
  SendMessagePayload,
  CandidateMember,
} from '../types/chat';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getMyChatGroupsApi = (params?: {
  search?: string;
  groupType?: string;
  page?: number;
  limit?: number;
}) =>
  axiosInstance.get<ApiResponse<{ groups: ChatGroup[]; total: number }>>(
    API_ROUTES.CHAT.GROUPS,
    { params }
  );

  //
export const createChatGroupApi = (payload: CreateGroupPayload) =>
  axiosInstance.post<ApiResponse<ChatGroup>>(API_ROUTES.CHAT.GROUPS, payload);
//
export const getGroupMessagesApi = (
  groupId: string,
  params?: { page?: number; limit?: number }
) =>
  axiosInstance.get<ApiResponse<{ messages: ChatMessage[]; total: number }>>(
    API_ROUTES.CHAT.MESSAGES(groupId),
    { params }
  );
//
export const sendChatMessageApi = (payload: SendMessagePayload) =>
  axiosInstance.post<ApiResponse<ChatMessage>>(
    API_ROUTES.CHAT.MESSAGES(payload.groupId),
    payload
  );

  //
export const addGroupMemberApi = (
  groupId: string,
  userIdOrIds: string | string[],
  role?: string
) =>
  axiosInstance.post<ApiResponse<ChatGroup>>(
    API_ROUTES.CHAT.MEMBERS(groupId),
    Array.isArray(userIdOrIds)
      ? { userIds: userIdOrIds, role }
      : { userId: userIdOrIds, role }
  );

export const removeGroupMemberApi = (groupId: string, userId: string) =>
  axiosInstance.delete<ApiResponse<ChatGroup>>(
    API_ROUTES.CHAT.MEMBER_DETAIL(groupId, userId)
  );

export const getOrCreateAiTutorApi = () =>
  axiosInstance.post<ApiResponse<ChatGroup>>(API_ROUTES.CHAT.AI_TUTOR);

export const getCandidateMembersApi = () =>
  axiosInstance.get<ApiResponse<CandidateMember[]>>(API_ROUTES.CHAT.CANDIDATE_MEMBERS);

export const clearGroupMessagesApi = (groupId: string) =>
  axiosInstance.delete<ApiResponse<{ clearedCount: number }>>(
    API_ROUTES.CHAT.MESSAGES(groupId)
  );
