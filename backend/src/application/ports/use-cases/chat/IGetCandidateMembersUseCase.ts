import { CandidateMemberDTO } from '@/application/dto/chat/chatDtos';

export interface IGetCandidateMembersUseCase {
  execute(userId: string, role: string): Promise<CandidateMemberDTO[]>;
}
