import { ChatMessage } from '../entities/ChatMessage';
import { IBaseRepository } from './IBaseRepository';

export interface ChatMessagePagination {
  page?: number;
  limit?: number;
  before?: Date;
}

export interface ChatMessageListResult {
  messages: ChatMessage[];
  total: number;
}

export interface IChatMessageRepository extends IBaseRepository<ChatMessage> {
  findByGroupId(groupId: string, pagination?: ChatMessagePagination): Promise<ChatMessageListResult>;
  findRecentHistory(groupId: string, limit?: number): Promise<ChatMessage[]>;
  markAsReadByGroup(groupId: string, userId: string): Promise<number>;
  softDelete(id: string): Promise<boolean>;
}