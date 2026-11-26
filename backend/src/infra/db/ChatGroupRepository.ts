import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IChatGroupRepository,
  ChatGroupFilters,
  ChatGroupPagination,
  ChatGroupListResult,
} from '../../domain/repositories/IChatGroupRepository';
import { ChatGroup } from '../../domain/entities/ChatGroup';
import { ChatGroupType, ChatMemberRole } from '../../domain/enums/ChatEnums';
import { ChatGroupModel, IChatGroupDocument } from './models/ChatGroupModel';
import { ChatGroupMapper } from './mappers/ChatGroupMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseRepository } from './BaseRepository';

@injectable()
export class ChatGroupRepository
  extends BaseRepository<ChatGroup, IChatGroupDocument>
  implements IChatGroupRepository
{
  protected readonly _model = ChatGroupModel;
  protected readonly _mapper = ChatGroupMapper;

  override async create(entity: ChatGroup): Promise<ChatGroup> {
    const doc = new ChatGroupModel(ChatGroupMapper.toPersistence(entity));
    await doc.save();
    await doc.populate([
      { path: 'createdBy', select: 'name role email' },
      { path: 'members.userId', select: 'name role email photo' },
    ]);
    return ChatGroupMapper.toDomain(doc);
  }

  override async update(id: string, entity: Partial<ChatGroup>): Promise<ChatGroup | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updateData = ChatGroupMapper.toPersistencePartial(entity);
    const doc = await ChatGroupModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), isDeleted: false },
      { $set: updateData },
      { new: true }
    )
      .populate({ path: 'createdBy', select: 'name role email' })
      .populate({ path: 'members.userId', select: 'name role email photo' });
    if (!doc) return null;
    return ChatGroupMapper.toDomain(doc);
  }

  async findById(id: string): Promise<ChatGroup | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await ChatGroupModel.findOne({ _id: id, isDeleted: false })
      .populate({ path: 'createdBy', select: 'name role email' })
      .populate({ path: 'members.userId', select: 'name role email photo' });
    if (!doc) return null;
    return ChatGroupMapper.toDomain(doc);
  }

  async findByUser(
    userId: string,
    filters?: ChatGroupFilters,
    pagination?: ChatGroupPagination
  ): Promise<ChatGroupListResult> {
    const userObjectId = new Types.ObjectId(userId);
    const query: FilterQuery<IChatGroupDocument> = {
      isDeleted: false,
      members: {
        $elemMatch: {
          userId: userObjectId,
        },
      },
    };

    if (filters?.search && filters.search.trim()) {
      query.name = { $regex: filters.search.trim(), $options: 'i' };
    }
    if (filters?.groupType) {
      query.groupType = filters.groupType as ChatGroupType;
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { updatedAt: -1 };
    if (pagination?.sortBy) {
      sortOptions = { [pagination.sortBy]: pagination.sortOrder === 'asc' ? 1 : -1 };
    }

    const [docs, total] = await Promise.all([
      ChatGroupModel.find(query)
        .populate({ path: 'createdBy', select: 'name role email' })
        .populate({ path: 'members.userId', select: 'name role email photo' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      ChatGroupModel.countDocuments(query),
    ]);

    return {
      groups: docs.map((doc) => ChatGroupMapper.toDomain(doc)),
      total,
    };
  }

  async findAiBotGroup(userId: string): Promise<ChatGroup | null> {
    const userObjectId = new Types.ObjectId(userId);
    const doc = await ChatGroupModel.findOne({
      groupType: ChatGroupType.AI_BOT,
      createdBy: userObjectId,
      isDeleted: false,
    })
      .populate({ path: 'createdBy', select: 'name role email' })
      .populate({ path: 'members.userId', select: 'name role email photo' });

    if (!doc) return null;
    return ChatGroupMapper.toDomain(doc);
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(userId)) return false;
    const count = await ChatGroupModel.countDocuments({
      _id: new Types.ObjectId(groupId),
      isDeleted: false,
      members: {
        $elemMatch: {
          userId: new Types.ObjectId(userId),
          leftAt: null,
        },
      },
    });
    return count > 0;
  }

  async isAdmin(groupId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(userId)) return false;
    const count = await ChatGroupModel.countDocuments({
      _id: new Types.ObjectId(groupId),
      isDeleted: false,
      members: {
        $elemMatch: {
          userId: new Types.ObjectId(userId),
          role: ChatMemberRole.ADMIN,
          leftAt: null,
        },
      },
    });
    return count > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await ChatGroupModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { isDeleted: true, isActive: false, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
}
