import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IChatGroupRepository } from '@/domain/repositories/IChatGroupRepository';
import { IChatMessageRepository } from '@/domain/repositories/IChatMessageRepository';
import { IGetOrCreateAiChatGroupUseCase } from '@/application/ports/use-cases/chat/IGetOrCreateAiChatGroupUseCase';
import { ChatGroupResponseDTO } from '@/application/dto/chat/chatDtos';
import { ChatGroup } from '@/domain/entities/ChatGroup';
import { ChatMessage } from '@/domain/entities/ChatMessage';
import { ChatGroupType, ChatMessageType } from '@/domain/enums/ChatEnums';

@injectable()
export class GetOrCreateAiChatGroup implements IGetOrCreateAiChatGroupUseCase {
  constructor(
    @inject(TYPES.ChatGroupRepository)
    private _groupRepo: IChatGroupRepository,
    @inject(TYPES.ChatMessageRepository)
    private _messageRepo: IChatMessageRepository
  ) {}

  async execute(userId: string, userRole?: string): Promise<ChatGroupResponseDTO> {
    const existing = await this._groupRepo.findAiBotGroup(userId);
    if (existing) {
      return existing.toJSON() as ChatGroupResponseDTO;
    }

    const roleUpper = (userRole || 'STUDENT').toUpperCase();
    let name = 'AI Study Tutor';
    let description = 'Your private 1-on-1 AI Study Tutor powered by Google Gemini';
    let welcome = 'Hello! I am your AI Study Tutor. Ask me any questions about your courses, homework, code, or exam topics. I can guide you step-by-step!';

    if (roleUpper === 'TEACHER') {
      name = 'AI Teaching Assistant';
      description = 'Your AI Copilot for lesson planning, question sets, and rubrics';
      welcome = 'Hello! I am your AI Teaching Assistant. I can help you draft lesson plans, generate quiz questions, design rubrics, and summarize topics.';
    } else if (roleUpper === 'ADMIN') {
      name = 'EduCore AI Secretary';
      description = 'Administrative AI Assistant for circulars, drafting, and policy';
      welcome = 'Hello! I am your EduCore AI Assistant. I can help draft institutional announcements, policy summaries, or administrative reports.';
    }

    const newGroup = ChatGroup.createNew({
      name,
      description,
      groupType: ChatGroupType.AI_BOT,
      isAdminOnly: false,
      createdBy: userId,
      initialMembers: [],
    });

    const saved = await this._groupRepo.create(newGroup);

    const welcomeMsg = ChatMessage.createNew({
      groupId: String(saved.id),
      senderId: 'ai',
      senderName: name,
      senderRole: 'AI',
      message: welcome,
      messageType: ChatMessageType.TEXT,
    });

    await this._messageRepo.create(welcomeMsg);

    return saved.toJSON() as ChatGroupResponseDTO;
  }
}
