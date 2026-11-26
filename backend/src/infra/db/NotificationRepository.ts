import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  INotificationRepository,
  NotificationFilters,
  NotificationPagination,
  NotificationListResult,
} from '../../domain/repositories/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';
import { NotificationModel, INotificationDocument } from './models/NotificationModel';
import { NotificationMapper } from './mappers/NotificationMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseRepository } from './BaseRepository';

@injectable()
export class NotificationRepository
  extends BaseRepository<Notification, INotificationDocument>
  implements INotificationRepository
{
  protected readonly _model = NotificationModel;
  protected readonly _mapper = NotificationMapper;

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findOne({ _id: id, isDeleted: false }).populate({
      path: 'createdBy',
      select: 'name role email',
    });
    if (!doc) return null;
    return NotificationMapper.toDomain(doc);
  }

  async findByCreator(
    creatorId: string,
    pagination: NotificationPagination
  ): Promise<NotificationListResult> {
    const query: FilterQuery<INotificationDocument> = {
      createdBy: new Types.ObjectId(creatorId),
      isDeleted: false,
    };

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    }

    const [docs, total] = await Promise.all([
      NotificationModel.find(query)
        .populate({ path: 'createdBy', select: 'name role email' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(query),
    ]);

    return {
      notifications: docs.map((doc) => NotificationMapper.toDomain(doc)),
      total,
    };
  }

  async findAll(
    filters: NotificationFilters,
    pagination: NotificationPagination
  ): Promise<NotificationListResult> {
    const query: FilterQuery<INotificationDocument> = { isDeleted: false };

    if (filters.createdBy) {
      query.createdBy = new Types.ObjectId(filters.createdBy);
    }

    if (filters.targetType) {
      query.targetType = filters.targetType;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ title: searchRegex }, { message: searchRegex }];
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    }

    const [docs, total] = await Promise.all([
      NotificationModel.find(query)
        .populate({ path: 'createdBy', select: 'name role email' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(query),
    ]);

    return {
      notifications: docs.map((doc) => NotificationMapper.toDomain(doc)),
      total,
    };
  }
}
