import { ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';

export interface IGetOrCreateAiChatGroupUseCase {
  execute(userId: string, userRole?: string): Promise<ChatGroupResponseDTO>;
}
