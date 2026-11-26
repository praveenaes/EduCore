import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { IChatMessageRepository, ChatMessagePagination } from '@/domain/repositories/IChatMessageRepository';
import { IGetChatGroupMessagesUseCase } from '@/application/ports/use-cases/chat/IGetChatGroupMessagesUseCase';
import { ChatMessageResponseDTO } from '@/application/dto/chat/chatDtos';
import { ForbiddenError, NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetChatGroupMessages implements IGetChatGroupMessagesUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository,
    @inject(TYPES.ChatMessageRepository)
    private _messageRepo: IChatMessageRepository
  ) {}

  async execute(
    groupId: string,
    userId: string,
    pagination?: ChatMessagePagination
  ): Promise<{ messages: ChatMessageResponseDTO[]; total: number }> {
    const isMember = await this._groupRepo.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not an active member of this chat group');
    }

    const result = await this._messageRepo.findByGroupId(groupId, pagination);

    this._messageRepo.markAsReadByGroup(groupId, userId).catch(() => {});

    return {
      messages: result.messages.map((m) => m.toJSON() as ChatMessageResponseDTO),
      total: result.total,
    };
  }
}