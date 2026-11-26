import { Types } from 'mongoose';
import { ChatGroup, ChatMemberItem, ChatLastMessageSummary } from '../../../domain/entities/ChatGroup';

export class ChatGroupMapper {
  static toDomain(doc: any): ChatGroup {
    const createdBy = doc.createdBy?._id
      ? doc.createdBy._id.toString()
      : doc.createdBy?.toString();

    const members: ChatMemberItem[] = (doc.members || []).map((m: any) => ({
      userId: m.userId?._id ? m.userId._id.toString() : m.userId?.toString(),
      role: m.role,
      joinedAt: m.joinedAt || new Date(),
      leftAt: m.leftAt || null,
      leftReason: m.leftReason || null,
      userName: m.userId?.name,
      userRole: m.userId?.role,
    }));

    let lastMessage: ChatLastMessageSummary | undefined;
    if (doc.lastMessage && doc.lastMessage.message) {
      lastMessage = {
        message: doc.lastMessage.message,
        senderId: doc.lastMessage.senderId?._id
          ? doc.lastMessage.senderId._id.toString()
          : doc.lastMessage.senderId?.toString(),
        senderName: doc.lastMessage.senderName,
        sentAt: doc.lastMessage.sentAt || new Date(),
        messageType: doc.lastMessage.messageType,
      };
    }

    return new ChatGroup({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      groupType: doc.groupType,
      isAdminOnly: Boolean(doc.isAdminOnly),
      createdBy,
      members,
      lastMessage,
      isActive: Boolean(doc.isActive),
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: ChatGroup): Record<string, any> {
    return {
      name: entity.name,
      description: entity.description,
      groupType: entity.groupType,
      isAdminOnly: entity.isAdminOnly,
      createdBy: new Types.ObjectId(entity.createdBy),
      members: entity.members.map((m) => ({
        userId: new Types.ObjectId(m.userId),
        role: m.role,
        joinedAt: m.joinedAt,
        leftAt: m.leftAt,
        leftReason: m.leftReason,
      })),
      lastMessage: entity.lastMessage
        ? {
            message: entity.lastMessage.message,
            senderId: Types.ObjectId.isValid(entity.lastMessage.senderId)
              ? new Types.ObjectId(entity.lastMessage.senderId)
              : undefined,
            senderName: entity.lastMessage.senderName,
            sentAt: entity.lastMessage.sentAt,
            messageType: entity.lastMessage.messageType,
          }
        : undefined,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<ChatGroup>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.name !== undefined) data.name = entity.name;
    if (entity.description !== undefined) data.description = entity.description;
    if (entity.isAdminOnly !== undefined) data.isAdminOnly = entity.isAdminOnly;
    if (entity.isActive !== undefined) data.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.members !== undefined) {
      data.members = entity.members.map((m) => ({
        userId: new Types.ObjectId(m.userId),
        role: m.role,
        joinedAt: m.joinedAt,
        leftAt: m.leftAt,
        leftReason: m.leftReason,
      }));
    }
    if ('lastMessage' in entity) {
      data.lastMessage = entity.lastMessage
        ? {
            message: entity.lastMessage.message,
            senderId: Types.ObjectId.isValid(entity.lastMessage.senderId)
              ? new Types.ObjectId(entity.lastMessage.senderId)
              : undefined,
            senderName: entity.lastMessage.senderName,
            sentAt: entity.lastMessage.sentAt,
            messageType: entity.lastMessage.messageType,
          }
        : null;
    }
    return data;
  }
}