import { AddGroupMemberDTO, ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';

export interface IAddGroupMemberUseCase {
  execute(dto: AddGroupMemberDTO): Promise<ChatGroupResponseDTO>;
}