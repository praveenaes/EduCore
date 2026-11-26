import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { IChatSocketService } from '@/application/ports/services/IChatSocketService';
import { IClearGroupMessagesUseCase } from '@/application/ports/use-cases/chat/IClearGroupMessagesUseCase';
import { ClearGroupMessagesDTO } from '@/application/dto/chat/chatDtos';
import { ChatMessageModel } from '@/infra/db/models/ChatMessageModel';
import { UserModel } from '@/infra/db/models/UserModel';
import { NotFoundError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class ClearGroupMessages implements IClearGroupMessagesUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository,
    @inject(TYPES.ChatSocketService)
    private _socketService: IChatSocketService
  ) {}

  async execute(dto: ClearGroupMessagesDTO): Promise<{ success: boolean; message: string }> {
    const group = await this._groupRepo.findById(dto.groupId);
    if (!group) {
      throw new NotFoundError('Chat group not found');
    }

    const user = await UserModel.findById(dto.requestedBy).select('role').lean();
    const isSystemAdmin = user?.role?.toUpperCase() === 'ADMIN';
    const isGroupMember = group.isMember(dto.requestedBy);
    const isGroupCreator = group.createdBy === dto.requestedBy;

    if (!isSystemAdmin && !isGroupMember && !isGroupCreator) {
      throw new ForbiddenError('You are not authorized to clear chat in this group');
    }

    await ChatMessageModel.deleteMany({
      groupId: new Types.ObjectId(dto.groupId),
    });

    group.clearLastMessage();
    await this._groupRepo.update(group.id!, group);

    this._socketService.sendMessageToGroup(dto.groupId, 'chat:messages_cleared', {
      groupId: dto.groupId,
      clearedBy: dto.requestedBy,
    });

    return {
      success: true,
      message: 'Chat cleared successfully',
    };
  }
}