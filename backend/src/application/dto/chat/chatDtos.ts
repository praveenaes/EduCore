import { ChatGroupType, ChatMemberRole, ChatMessageType } from '@/domain/enums/ChatEnums';

export interface CreateChatGroupDTO {
  name: string;
  description?: string;
  groupType?: ChatGroupType;
  isAdminOnly?: boolean;
  createdBy: string;
}

export interface UpdateChatGroupDTO {
  name?: string;
  description?: string;
  isAdminOnly?: boolean;
}

export interface SendChatMessageDTO {
  groupId: string;
  senderId: string;
  message: string;
  messageType?: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  userRole?: string;
  userName?: string;
}

export interface AddGroupMemberDTO {
  groupId: string;
  userId?: string;
  userIds?: string[];
  role?: ChatMemberRole;
  requestedBy: string;
}

export interface RemoveGroupMemberDTO {
  groupId: string;
  userId: string;
  requestedBy: string;
}

export interface ClearGroupMessagesDTO {
  groupId: string;
  requestedBy: string;
}

export interface CandidateMemberDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  batchName?: string;
  subtitle?: string;
}

export interface ChatMemberResponseDTO {
  userId: string;
  role: ChatMemberRole;
  joinedAt: string;
  leftAt?: string | null;
  leftReason?: 'LEFT' | 'REMOVED' | null;
  userName?: string;
  userRole?: string;
}

export interface ChatGroupResponseDTO {
  id: string;
  name: string;
  description?: string;
  groupType: ChatGroupType;
  isAdminOnly: boolean;
  createdBy: string;
  members: ChatMemberResponseDTO[];
  lastMessage?: {
    message: string;
    senderId: string;
    senderName?: string;
    sentAt: string;
    messageType: ChatMessageType;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageResponseDTO {
  id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  message: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isAi: boolean;
  aiPrompt?: string;
  readBy: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}