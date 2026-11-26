import { ChatMessageType } from '../enums/ChatEnums';

export interface ChatMessageProps {
  id?: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  message: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isAi: boolean;
  aiPrompt?: string;
  readBy: string[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ChatMessage {
  private _props: ChatMessageProps;

  constructor(props: ChatMessageProps) {
    this._props = {
      ...props,
      messageType: props.messageType || ChatMessageType.TEXT,
      isAi: props.isAi ?? false,
      readBy: props.readBy ? [...props.readBy] : [],
      isDeleted: props.isDeleted ?? false,
    };
  }

  get id(): string | undefined { return this._props.id; }
  get groupId(): string { return this._props.groupId; }
  get senderId(): string { return this._props.senderId; }
  get senderName(): string | undefined { return this._props.senderName; }
  get senderRole(): string | undefined { return this._props.senderRole; }
  get senderAvatar(): string | undefined { return this._props.senderAvatar; }
  get message(): string { return this._props.message; }
  get messageType(): ChatMessageType { return this._props.messageType; }
  get attachmentUrl(): string | undefined { return this._props.attachmentUrl; }
  get attachmentName(): string | undefined { return this._props.attachmentName; }
  get attachmentSize(): number | undefined { return this._props.attachmentSize; }
  get isAi(): boolean { return this._props.isAi; }
  get aiPrompt(): string | undefined { return this._props.aiPrompt; }
  get readBy(): string[] { return this._props.readBy; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  markReadBy(userId: string): void {
    const uidStr = String(userId);
    if (!this._props.readBy.includes(uidStr)) {
      this._props.readBy.push(uidStr);
      this._props.updatedAt = new Date();
    }
  }

  isReadBy(userId: string): boolean {
    return this._props.readBy.includes(String(userId));
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.message = 'This message was deleted';
    this._props.attachmentUrl = undefined;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    groupId: string;
    senderId: string;
    senderName?: string;
    senderRole?: string;
    senderAvatar?: string;
    message: string;
    messageType?: ChatMessageType;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
    isAi?: boolean;
    aiPrompt?: string;
  }): ChatMessage {
    return new ChatMessage({
      groupId: props.groupId,
      senderId: props.senderId,
      senderName: props.senderName,
      senderRole: props.senderRole,
      senderAvatar: props.senderAvatar,
      message: props.message.trim(),
      messageType: props.messageType || ChatMessageType.TEXT,
      attachmentUrl: props.attachmentUrl,
      attachmentName: props.attachmentName,
      attachmentSize: props.attachmentSize,
      isAi: props.isAi ?? false,
      aiPrompt: props.aiPrompt,
      readBy: [String(props.senderId)],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static createAiMessage(props: {
    groupId: string;
    message: string;
    aiPrompt?: string;
  }): ChatMessage {
    return new ChatMessage({
      groupId: props.groupId,
      senderId: 'ai-assistant',
      senderName: 'EduCore AI Assistant',
      senderRole: 'AI_BOT',
      message: props.message.trim(),
      messageType: ChatMessageType.AI_RESPONSE,
      isAi: true,
      aiPrompt: props.aiPrompt,
      readBy: [],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON(): Record<string, any> {
    return {
      id: this._props.id,
      groupId: this._props.groupId,
      senderId: this._props.senderId,
      senderName: this._props.senderName,
      senderRole: this._props.senderRole,
      senderAvatar: this._props.senderAvatar,
      message: this._props.message,
      messageType: this._props.messageType,
      attachmentUrl: this._props.attachmentUrl,
      attachmentName: this._props.attachmentName,
      attachmentSize: this._props.attachmentSize,
      isAi: this._props.isAi,
      aiPrompt: this._props.aiPrompt,
      readBy: this._props.readBy,
      isDeleted: this._props.isDeleted,
      createdAt: this._props.createdAt?.toISOString(),
      updatedAt: this._props.updatedAt?.toISOString(),
    };
  }
}