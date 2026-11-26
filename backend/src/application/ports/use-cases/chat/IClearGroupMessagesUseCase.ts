import { ClearGroupMessagesDTO } from '@/application/dto/chat/chatDtos';

export interface IClearGroupMessagesUseCase {
  execute(dto: ClearGroupMessagesDTO): Promise<{ success: boolean; message: string }>;
}