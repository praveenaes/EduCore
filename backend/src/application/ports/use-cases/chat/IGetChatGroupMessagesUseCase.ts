import { ChatMessageResponseDTO } from '@/application/dto/chat/chatDtos';
import { ChatMessagePagination } from '@/domain/repositories/IChatMessageRepository';

export interface IGetChatGroupMessagesUseCase {
  execute(
    groupId: string,
    userId: string,
    pagination?: ChatMessagePagination
  ): Promise<{ messages: ChatMessageResponseDTO[]; total: number }>;
}