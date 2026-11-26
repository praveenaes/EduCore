import { ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';
import { ChatGroupFilters, ChatGroupPagination } from '@/domain/repositories/IChatGroupRepository';

export interface IGetUserChatGroupsUseCase {
  execute(
    userId: string,
    filters?: ChatGroupFilters,
    pagination?: ChatGroupPagination
  ): Promise<{ groups: ChatGroupResponseDTO[]; total: number }>;
}