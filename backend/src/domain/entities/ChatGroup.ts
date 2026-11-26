import { ChatGroupType, ChatMemberRole, ChatMessageType } from '../enums/ChatEnums';

export interface ChatMemberItem {
  userId: string;
  role: ChatMemberRole;
  joinedAt: Date;
  leftAt?: Date | null;
  leftReason?: 'LEFT' | 'REMOVED' | null;
  userName?: string;
  userRole?: string;
}

export interface ChatLastMessageSummary {
  message: string;
  senderId: string;
  senderName?: string;
  sentAt: Date;
  messageType: ChatMessageType;
}

export interface ChatGroupProps {
  id?: string;
  name: string;
  description?: string;
  groupType: ChatGroupType;
  isAdminOnly: boolean;
  createdBy: string;
  members: ChatMemberItem[];
  lastMessage?: ChatLastMessageSummary;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ChatGroup {
  private _props: ChatGroupProps;

  constructor(props: ChatGroupProps) {
    this._props = {
      ...props,
      members: props.members ? [...props.members] : [],
      isAdminOnly: props.isAdminOnly ?? false,
      isActive: props.isActive ?? true,
      isDeleted: props.isDeleted ?? false,
    };
  }

  get id(): string | undefined { return this._props.id; }
  get name(): string { return this._props.name; }
  get description(): string | undefined { return this._props.description; }
  get groupType(): ChatGroupType { return this._props.groupType; }
  get isAdminOnly(): boolean { return this._props.isAdminOnly; }
  get createdBy(): string { return this._props.createdBy; }
  get members(): ChatMemberItem[] { return this._props.members; }
  get lastMessage(): ChatLastMessageSummary | undefined { return this._props.lastMessage; }
  get isActive(): boolean { return this._props.isActive; }
  get isDeleted(): boolean { return this._props.isDeleted; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  isMember(userId: string): boolean {
    return this._props.members.some(
      (m) => String(m.userId) === String(userId) && !m.leftAt
    );
  }

  isAdmin(userId: string): boolean {
    if (String(this._props.createdBy) === String(userId)) {
      return true;
    }
    return this._props.members.some(
      (m) =>
        String(m.userId) === String(userId) &&
        m.role === ChatMemberRole.ADMIN &&
        !m.leftAt
    );
  }

  addMember(userId: string, role: ChatMemberRole = ChatMemberRole.MEMBER): void {
    const existing = this._props.members.find(
      (m) => String(m.userId) === String(userId)
    );
    if (existing) {
      existing.leftAt = null;
      existing.leftReason = null;
      existing.role = role;
    } else {
      this._props.members.push({
        userId,
        role,
        joinedAt: new Date(),
      });
    }
    this._props.updatedAt = new Date();
  }

  removeMember(userId: string, reason: 'LEFT' | 'REMOVED' = 'REMOVED'): void {
    const member = this._props.members.find(
      (m) => String(m.userId) === String(userId) && !m.leftAt
    );
    if (member) {
      member.leftAt = new Date();
      member.leftReason = reason;
      this._props.updatedAt = new Date();
    }
  }

  clearLastMessage(): void {
    this._props.lastMessage = undefined;
    this._props.updatedAt = new Date();
  }

  updateDetails(name: string, description?: string, isAdminOnly?: boolean): void {
    this._props.name = name.trim();
    if (description !== undefined) {
      this._props.description = description.trim();
    }
    if (isAdminOnly !== undefined) {
      this._props.isAdminOnly = isAdminOnly;
    }
    this._props.updatedAt = new Date();
  }

  updateLastMessage(summary: ChatLastMessageSummary): void {
    this._props.lastMessage = summary;
    this._props.updatedAt = new Date();
  }

  markDeleted(): void {
    this._props.isDeleted = true;
    this._props.isActive = false;
    this._props.updatedAt = new Date();
  }

  static createNew(props: {
    name: string;
    description?: string;
    groupType?: ChatGroupType;
    isAdminOnly?: boolean;
    createdBy: string;
    initialMembers?: Array<{ userId: string; role?: ChatMemberRole }>;
  }): ChatGroup {
    const members: ChatMemberItem[] = [
      {
        userId: props.createdBy,
        role: ChatMemberRole.ADMIN,
        joinedAt: new Date(),
      },
    ];

    if (props.initialMembers?.length) {
      props.initialMembers.forEach((m) => {
        if (String(m.userId) !== String(props.createdBy)) {
          members.push({
            userId: m.userId,
            role: m.role || ChatMemberRole.MEMBER,
            joinedAt: new Date(),
          });
        }
      });
    }

    return new ChatGroup({
      name: props.name.trim(),
      description: props.description?.trim(),
      groupType: props.groupType || ChatGroupType.CUSTOM,
      isAdminOnly: props.isAdminOnly ?? false,
      createdBy: props.createdBy,
      members,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON(): Record<string, any> {
    return {
      id: this._props.id,
      name: this._props.name,
      description: this._props.description,
      groupType: this._props.groupType,
      isAdminOnly: this._props.isAdminOnly,
      createdBy: this._props.createdBy,
      members: this._props.members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt?.toISOString(),
        leftAt: m.leftAt?.toISOString(),
        leftReason: m.leftReason,
        userName: m.userName,
        userRole: m.userRole,
      })),
      lastMessage: this._props.lastMessage
        ? {
            message: this._props.lastMessage.message,
            senderId: this._props.lastMessage.senderId,
            senderName: this._props.lastMessage.senderName,
            sentAt: this._props.lastMessage.sentAt?.toISOString(),
            messageType: this._props.lastMessage.messageType,
          }
        : undefined,
      isActive: this._props.isActive,
      isDeleted: this._props.isDeleted,
      createdAt: this._props.createdAt?.toISOString(),
      updatedAt: this._props.updatedAt?.toISOString(),
    };
  }
}