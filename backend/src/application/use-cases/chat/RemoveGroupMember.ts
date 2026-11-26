import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { IChatMessageRepository } from '@/domain/repositories/IChatMessageRepository';
import { IChatSocketService } from '@/application/ports/services/IChatSocketService';
import { IRemoveGroupMemberUseCase } from '@/application/ports/use-cases/chat/IRemoveGroupMemberUseCase';
import {
  RemoveGroupMemberDTO,
  ChatGroupResponseDTO,
  ChatMessageResponseDTO,
} from '@/application/dto/chat/chatDtos';
import { ChatMessage } from '@/domain/entities/ChatMessage';
import { ChatMessageType } from '@/domain/enums/ChatEnums';
import { UserModel } from '@/infra/db/models/UserModel';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class RemoveGroupMember implements IRemoveGroupMemberUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository,
    @inject(TYPES.ChatMessageRepository)
    private _messageRepo: IChatMessageRepository,
    @inject(TYPES.ChatSocketService)
    private _socketService: IChatSocketService
  ) {}

  async execute(dto: RemoveGroupMemberDTO): Promise<ChatGroupResponseDTO> {
    const group = await this._groupRepo.findById(dto.groupId);
    if (!group) {
      throw new NotFoundError('Chat group not found');
    }

    const isSelf = dto.userId === dto.requestedBy;
    const isAdmin = group.isAdmin(dto.requestedBy) || group.createdBy === dto.requestedBy;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenError('You are not authorized to remove members from this group');
    }

    if (dto.userId === group.createdBy) {
      throw new ValidationError('Group creator cannot be removed from the group');
    }

    group.removeMember(dto.userId, isSelf ? 'LEFT' : 'REMOVED');
    const updated = await this._groupRepo.update(group.id!, group);
    if (!updated) {
      throw new NotFoundError('Chat group not found');
    }

    const result = updated.toJSON() as ChatGroupResponseDTO;

    this._socketService.sendToUser(dto.userId, 'chat:group_removed', {
      groupId: dto.groupId,
      reason: isSelf ? 'LEFT' : 'REMOVED',
    });
    this._socketService.sendMessageToGroup(dto.groupId, 'chat:member_removed', {
      groupId: dto.groupId,
      userId: dto.userId,
      reason: isSelf ? 'LEFT' : 'REMOVED',
    });

    const user = await UserModel.findById(dto.userId).select('name role').lean();
    const userName = user?.name || 'A member';
    const systemText = isSelf
      ? `${userName} left the group`
      : `${userName} was removed from the group`;

    const systemMessage = ChatMessage.createNew({
      groupId: dto.groupId,
      senderId: dto.requestedBy,
      senderName: 'System',
      senderRole: 'SYSTEM',
      message: systemText,
      messageType: ChatMessageType.SYSTEM,
    });

    const savedMessage = await this._messageRepo.create(systemMessage);
    const messageResult = savedMessage.toJSON() as ChatMessageResponseDTO;

    group.updateLastMessage({
      message: systemText,
      senderId: dto.requestedBy,
      senderName: 'System',
      sentAt: savedMessage.createdAt || new Date(),
      messageType: ChatMessageType.SYSTEM,
    });
    await this._groupRepo.update(group.id!, {
      lastMessage: group.lastMessage,
    });

    this._socketService.sendMessageToGroup(
      dto.groupId,
      'chat:new_message',
      messageResult
    );

    return result;
  }
}