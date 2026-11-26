import { CreateChatGroupDTO, ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';

export interface ICreateChatGroupUseCase {
  execute(dto: CreateChatGroupDTO): Promise<ChatGroupResponseDTO>;
}