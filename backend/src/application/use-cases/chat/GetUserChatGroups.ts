import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository, ChatGroupFilters, ChatGroupPagination } from '@/domain/repositories/IChatGroupRepository';
import { IGetUserChatGroupsUseCase } from '@/application/ports/use-cases/chat/IGetUserChatGroupsUseCase';
import { ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';

@injectable()
export class GetUserChatGroups implements IGetUserChatGroupsUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository
  ) {}

  async execute(
    userId: string,
    filters?: ChatGroupFilters,
    pagination?: ChatGroupPagination
  ): Promise<{ groups: ChatGroupResponseDTO[]; total: number }> {
    const result = await this._groupRepo.findByUser(userId, filters, pagination);
    return {
      groups: result.groups.map((g) => g.toJSON() as ChatGroupResponseDTO),
      total: result.total,
    };
  }
}