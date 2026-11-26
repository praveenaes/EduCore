import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { IChatSocketService } from '@/application/ports/services/IChatSocketService';
import { IAddGroupMemberUseCase } from '@/application/ports/use-cases/chat/IAddGroupMemberUseCase';
import { AddGroupMemberDTO, ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';
import { ChatMemberRole } from '@/domain/enums/ChatEnums';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class AddGroupMember implements IAddGroupMemberUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository,
    @inject(TYPES.ChatSocketService)
    private _socketService: IChatSocketService
  ) {}

  async execute(dto: AddGroupMemberDTO): Promise<ChatGroupResponseDTO> {
    const group = await this._groupRepo.findById(dto.groupId);
    if (!group) {
      throw new NotFoundError('Chat group not found');
    }

    if (!group.isAdmin(dto.requestedBy) && group.createdBy !== dto.requestedBy) {
      throw new ForbiddenError('Only group administrators can add members');
    }

    const targetUserIds = Array.from(
      new Set(
        (dto.userIds && dto.userIds.length > 0
          ? dto.userIds
          : dto.userId
          ? [dto.userId]
          : []
        ).filter(Boolean)
      )
    );

    if (targetUserIds.length === 0) {
      throw new ValidationError('No users specified to add');
    }

    const addedUserIds: string[] = [];
    for (const uid of targetUserIds) {
      if (!group.isMember(uid)) {
        group.addMember(uid, dto.role || ChatMemberRole.MEMBER);
        addedUserIds.push(uid);
      }
    }

    if (addedUserIds.length === 0) {
      throw new ValidationError('All specified users are already members of this group');
    }

    const updated = await this._groupRepo.update(group.id!, group);
    if (!updated) {
      throw new NotFoundError('Chat group not found');
    }

    const result = updated.toJSON() as ChatGroupResponseDTO;

    addedUserIds.forEach((uid) => {
      this._socketService.sendToUser(uid, 'chat:group_added', result);
      this._socketService.sendMessageToGroup(dto.groupId, 'chat:member_added', {
        groupId: dto.groupId,
        userId: uid,
      });
    });

    return result;
  }
}
