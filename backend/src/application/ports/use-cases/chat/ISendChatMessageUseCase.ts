import { SendChatMessageDTO, ChatMessageResponseDTO } from '@/application/dto/chat/chatDtos';

export interface ISendChatMessageUseCase {
  execute(dto: SendChatMessageDTO): Promise<ChatMessageResponseDTO>;
}