import { z } from 'zod';
import { ChatGroupType, ChatMessageType, ChatMemberRole } from '@/domain/enums/ChatEnums';

export const createChatGroupSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(100),
  description: z.string().trim().max(500).optional(),
  groupType: z.nativeEnum(ChatGroupType).optional().default(ChatGroupType.CUSTOM),
  isAdminOnly: z.boolean().optional().default(false),
});

export const sendChatMessageSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(5000),
  messageType: z.nativeEnum(ChatMessageType).optional().default(ChatMessageType.TEXT),
  attachmentUrl: z.string().trim().optional(),
  attachmentName: z.string().trim().optional(),
  attachmentSize: z.number().optional(),
});

export const getMessagesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const addMemberSchema = z.object({
  userId: z.string().trim().optional(),
  userIds: z.array(z.string().trim()).optional(),
  role: z.nativeEnum(ChatMemberRole).optional().default(ChatMemberRole.MEMBER),
});
