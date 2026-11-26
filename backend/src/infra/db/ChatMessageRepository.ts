import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IChatMessageRepository,
  ChatMessagePagination,
  ChatMessageListResult,
} from '../../domain/repositories/IChatMessageRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { ChatMessageModel, IChatMessageDocument } from './models/ChatMessageModel';
import { ChatMessageMapper } from './mappers/ChatMessageMapper';
import { BaseRepository } from './BaseRepository';

@injectable()
export class ChatMessageRepository
  extends BaseRepository<ChatMessage, IChatMessageDocument>
  implements IChatMessageRepository
{
  protected readonly _model = ChatMessageModel;
  protected readonly _mapper = ChatMessageMapper;

  async findById(id: string): Promise<ChatMessage | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await ChatMessageModel.findOne({ _id: id, isDeleted: false })
      .populate({ path: 'senderId', select: 'name role email photo' });
    if (!doc) return null;
    return ChatMessageMapper.toDomain(doc);
  }

  async findByGroupId(
    groupId: string,
    pagination?: ChatMessagePagination
  ): Promise<ChatMessageListResult> {
    if (!Types.ObjectId.isValid(groupId)) return { messages: [], total: 0 };

    const query: FilterQuery<IChatMessageDocument> = {
      groupId: new Types.ObjectId(groupId),
      isDeleted: false,
    };

    if (pagination?.before) {
      query.createdAt = { $lt: pagination.before };
    }

    const limit = pagination?.limit || 50;
    const page = pagination?.page || 1;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ChatMessageModel.find(query)
        .populate({ path: 'senderId', select: 'name role email photo' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatMessageModel.countDocuments(query),
    ]);

    const messages = docs.reverse().map((doc) => ChatMessageMapper.toDomain(doc));

    return {
      messages,
      total,
    };
  }

  async findRecentHistory(groupId: string, limit = 10): Promise<ChatMessage[]> {
    if (!Types.ObjectId.isValid(groupId)) return [];

    const docs = await ChatMessageModel.find({
      groupId: new Types.ObjectId(groupId),
      isDeleted: false,
    })
      .populate({ path: 'senderId', select: 'name role email photo' })
      .sort({ createdAt: -1 })
      .limit(limit);

    return docs.reverse().map((doc) => ChatMessageMapper.toDomain(doc));
  }

  async markAsReadByGroup(groupId: string, userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(userId)) return 0;

    const userObjectId = new Types.ObjectId(userId);
    const result = await ChatMessageModel.updateMany(
      {
        groupId: new Types.ObjectId(groupId),
        readBy: { $ne: userObjectId },
      },
      {
        $addToSet: { readBy: userObjectId },
      }
    );

    return result.modifiedCount;
  }

  async softDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await ChatMessageModel.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        $set: {
          isDeleted: true,
          message: 'This message was deleted',
          attachmentUrl: null,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }
}