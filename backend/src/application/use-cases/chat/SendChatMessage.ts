import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { IChatMessageRepository } from '@/domain/repositories/IChatMessageRepository';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IAIService, AIChatHistoryItem } from '@/application/ports/services/IAIService';
import { IChatSocketService } from '@/application/ports/services/IChatSocketService';
import { ISendChatMessageUseCase } from '@/application/ports/use-cases/chat/ISendChatMessageUseCase';
import { SendChatMessageDTO, ChatMessageResponseDTO } from '@/application/dto/chat/chatDtos';
import { ChatMessage } from '@/domain/entities/ChatMessage';
import { ChatGroupType, ChatMessageType } from '@/domain/enums/ChatEnums';
import { ValidationError, NotFoundError, ForbiddenError } from '@/shared/errors/AppError';
import { logger } from '@/infra/logger/logger';

@injectable()
export class SendChatMessage implements ISendChatMessageUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository,
    @inject(TYPES.ChatMessageRepository)
    private _messageRepo: IChatMessageRepository,
    @inject(TYPES.AIService)
    private _aiService: IAIService,
    @inject(TYPES.ChatSocketService)
    private _socketService: IChatSocketService,
    @inject(TYPES.UserRepository)
    private _userRepo: IUserRepository
  ) {}

  async execute(dto: SendChatMessageDTO): Promise<ChatMessageResponseDTO> {
    if (!dto.message || !dto.message.trim()) {
      throw new ValidationError('Message content cannot be empty');
    }

    const group = await this._groupRepo.findById(dto.groupId);
    if (!group) {
      throw new NotFoundError('Chat group not found');
    }

    if (!group.isMember(dto.senderId)) {
      throw new ForbiddenError('You are not an active member of this chat group');
    }

    if (group.isAdminOnly && !group.isAdmin(dto.senderId)) {
      throw new ForbiddenError('Only group administrators can post messages in this group');
    }

    const trimmedMsg = dto.message.trim();

    let senderName = dto.userName;
    if (!senderName) {
      const user = await this._userRepo.findById(dto.senderId);
      senderName = user?.name || user?.email || 'User';
    }

    const userMessage = ChatMessage.createNew({
      groupId: dto.groupId,
      senderId: dto.senderId,
      senderName,
      senderRole: dto.userRole,
      message: trimmedMsg,
      messageType: dto.messageType || ChatMessageType.TEXT,
      attachmentUrl: dto.attachmentUrl,
      attachmentName: dto.attachmentName,
      attachmentSize: dto.attachmentSize,
    });

    const savedUserMsg = await this._messageRepo.create(userMessage);
    const userMsgResult = savedUserMsg.toJSON() as ChatMessageResponseDTO;

    group.updateLastMessage({
      message: savedUserMsg.message,
      senderId: savedUserMsg.senderId,
      senderName: savedUserMsg.senderName,
      sentAt: savedUserMsg.createdAt || new Date(),
      messageType: savedUserMsg.messageType,
    });
    await this._groupRepo.update(group.id!, {
      lastMessage: group.lastMessage,
    });

    this._socketService.sendMessageToGroup(
      dto.groupId,
      'chat:new_message',
      userMsgResult
    );

    const isAiBotChannel = group.groupType === ChatGroupType.AI_BOT;
    const hasAiMention = /@(ai|educore)\b/i.test(trimmedMsg) || /^\/ai\b/i.test(trimmedMsg);

    if (isAiBotChannel || hasAiMention) {
      this._processAiResponseAsync(group.id!, trimmedMsg, dto);
    }

    return userMsgResult;
  }

  private async _processAiResponseAsync(
    groupId: string,
    rawPrompt: string,
    dto: SendChatMessageDTO
  ): Promise<void> {
    try {
      this._socketService.sendMessageToGroup(groupId, 'chat:typing', {
        isAi: true,
        isTyping: true,
      });

      const cleanPrompt = rawPrompt
        .replace(/@(ai|educore)\b/gi, '')
        .replace(/^\/ai\b/gi, '')
        .trim();

      const recentMessages = await this._messageRepo.findRecentHistory(groupId, 10);
      const history: AIChatHistoryItem[] = recentMessages
        .slice(0, -1)
        .map((m) => ({
          role: m.isAi ? 'model' : 'user',
          text: m.message,
        }));

      const aiResponseText = await this._aiService.generateChatResponse(
        cleanPrompt,
        history,
        {
          userRole: dto.userRole,
          userName: dto.userName,
        }
      );

      this._socketService.sendMessageToGroup(groupId, 'chat:typing', {
        isAi: true,
        isTyping: false,
      });

      const aiMessage = ChatMessage.createAiMessage({
        groupId,
        message: aiResponseText,
        aiPrompt: cleanPrompt,
      });

      const savedAiMsg = await this._messageRepo.create(aiMessage);
      const aiMsgResult = savedAiMsg.toJSON() as ChatMessageResponseDTO;

      const group = await this._groupRepo.findById(groupId);
      if (group) {
        group.updateLastMessage({
          message: savedAiMsg.message,
          senderId: savedAiMsg.senderId,
          senderName: savedAiMsg.senderName,
          sentAt: savedAiMsg.createdAt || new Date(),
          messageType: savedAiMsg.messageType,
        });
        await this._groupRepo.update(groupId, {
          lastMessage: group.lastMessage,
        });
      }

      this._socketService.sendMessageToGroup(groupId, 'chat:new_message', aiMsgResult);
    } catch (err) {
      logger.error('Failed to process AI chat response:', err);
      this._socketService.sendMessageToGroup(groupId, 'chat:typing', {
        isAi: true,
        isTyping: false,
      });
    }
  }
}