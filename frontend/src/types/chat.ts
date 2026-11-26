export const ChatGroupType = {
  CUSTOM: 'CUSTOM',
  DIRECT: 'DIRECT',
  AI_BOT: 'AI_BOT',
} as const;
export type ChatGroupType = (typeof ChatGroupType)[keyof typeof ChatGroupType];

export const ChatMemberRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;
export type ChatMemberRole = (typeof ChatMemberRole)[keyof typeof ChatMemberRole];

export const ChatMessageType = {
  TEXT: 'TEXT',
  AI_RESPONSE: 'AI_RESPONSE',
  SYSTEM: 'SYSTEM',
} as const;
export type ChatMessageType = (typeof ChatMessageType)[keyof typeof ChatMessageType];

export const AiPersona = {
  STUDENT_TUTOR: 'STUDENT_TUTOR',
  TEACHER_COPILOT: 'TEACHER_COPILOT',
  ADMIN_SECRETARY: 'ADMIN_SECRETARY',
} as const;
export type AiPersona = (typeof AiPersona)[keyof typeof AiPersona];

export interface CandidateMember {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  batchName?: string;
  subtitle?: string;
}

export interface ChatMemberItem {
  userId: string;
  role: ChatMemberRole;
  joinedAt: string;
  leftAt?: string | null;
  leftReason?: 'LEFT' | 'REMOVED' | null;
  userName?: string;
  userRole?: string;
}

export interface ChatLastMessageSummary {
  message: string;
  senderId: string;
  senderName?: string;
  sentAt: string;
  messageType: ChatMessageType;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  groupType: ChatGroupType;
  isAdminOnly: boolean;
  createdBy: string;
  members: ChatMemberItem[];
  lastMessage?: ChatLastMessageSummary;
  isActive: boolean;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  message: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isAi: boolean;
  isAiGenerating?: boolean;
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  isAdminOnly?: boolean;
}

export interface SendMessagePayload {
  groupId: string;
  message: string;
  messageType?: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
}
