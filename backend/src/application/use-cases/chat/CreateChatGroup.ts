import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { ICreateChatGroupUseCase } from '@/application/ports/use-cases/chat/ICreateChatGroupUseCase';
import { CreateChatGroupDTO, ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';
import { ChatGroup } from '@/domain/entities/ChatGroup';

@injectable()
export class CreateChatGroup implements ICreateChatGroupUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository
  ) {}

  async execute(dto: CreateChatGroupDTO): Promise<ChatGroupResponseDTO> {
    const group = ChatGroup.createNew({
      name: dto.name,
      description: dto.description,
      groupType: dto.groupType,
      isAdminOnly: dto.isAdminOnly,
      createdBy: dto.createdBy,
    });

    const saved = await this._groupRepo.create(group);
    return saved.toJSON() as ChatGroupResponseDTO;
  }
}