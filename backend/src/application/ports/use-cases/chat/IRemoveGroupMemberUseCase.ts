import { RemoveGroupMemberDTO, ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';

export interface IRemoveGroupMemberUseCase {
  execute(dto: RemoveGroupMemberDTO): Promise<ChatGroupResponseDTO>;
}
