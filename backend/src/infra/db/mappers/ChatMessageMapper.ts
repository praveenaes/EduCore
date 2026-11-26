import { Types } from 'mongoose';
import { ChatMessage } from '../../../domain/entities/ChatMessage';

export class ChatMessageMapper {
  static toDomain(doc: any): ChatMessage {
    const groupId = doc.groupId?._id
      ? doc.groupId._id.toString()
      : doc.groupId?.toString();

    let senderId = '';
    if (doc.senderId) {
      senderId = doc.senderId._id
        ? doc.senderId._id.toString()
        : doc.senderId.toString();
    } else if (doc.isAi) {
      senderId = 'ai-assistant';
    }

    const senderName =
      doc.senderName ||
      doc.senderId?.name ||
      (doc.isAi ? 'EduCore AI Assistant' : undefined);

    const senderRole =
      doc.senderRole ||
      doc.senderId?.role ||
      (doc.isAi ? 'AI_BOT' : undefined);

    const senderAvatar = doc.senderAvatar || doc.senderId?.photo;

    const readBy = (doc.readBy || []).map((uid: any) =>
      uid?._id ? uid._id.toString() : uid.toString()
    );

    return new ChatMessage({
      id: doc._id.toString(),
      groupId,
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      message: doc.message,
      messageType: doc.messageType,
      attachmentUrl: doc.attachmentUrl,
      attachmentName: doc.attachmentName,
      attachmentSize: doc.attachmentSize,
      isAi: Boolean(doc.isAi),
      aiPrompt: doc.aiPrompt,
      readBy,
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: ChatMessage): Record<string, any> {
    return {
      groupId: new Types.ObjectId(entity.groupId),
      senderId:
        entity.senderId && Types.ObjectId.isValid(entity.senderId)
          ? new Types.ObjectId(entity.senderId)
          : undefined,
      senderName: entity.senderName,
      senderRole: entity.senderRole,
      senderAvatar: entity.senderAvatar,
      message: entity.message,
      messageType: entity.messageType,
      attachmentUrl: entity.attachmentUrl,
      attachmentName: entity.attachmentName,
      attachmentSize: entity.attachmentSize,
      isAi: entity.isAi,
      aiPrompt: entity.aiPrompt,
      readBy: (entity.readBy || [])
        .filter((uid) => Types.ObjectId.isValid(uid))
        .map((uid) => new Types.ObjectId(uid)),
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<ChatMessage>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.message !== undefined) data.message = entity.message;
    if (entity.attachmentUrl !== undefined) data.attachmentUrl = entity.attachmentUrl;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.readBy !== undefined) {
      data.readBy = entity.readBy
        .filter((uid) => Types.ObjectId.isValid(uid))
        .map((uid) => new Types.ObjectId(uid));
    }
    return data;
  }
}