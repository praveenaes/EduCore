import { injectable } from 'inversify';
import { Types } from 'mongoose';
import {
  INotificationRecipientRepository,
  RecipientPagination,
  RecipientListResult,
} from '../../domain/repositories/INotificationRecipientRepository';
import { NotificationRecipient } from '../../domain/entities/NotificationRecipient';
import {
  NotificationStatus,
  NotificationTargetType,
} from '../../domain/enums/NotificationEnums';
import { UserRole } from '../../domain/enums/UserRole';
import {
  NotificationRecipientModel,
  INotificationRecipientDocument,
} from './models/NotificationRecipientModel';
import { UserModel } from './models/UserModel';
import { StudentModel } from './models/StudentModel';
import { BatchModel } from './models/BatchModel';
import { NotificationRecipientMapper } from './mappers/NotificationRecipientMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseRepository } from './BaseRepository';

@injectable()
export class NotificationRecipientRepository
  extends BaseRepository<NotificationRecipient, INotificationRecipientDocument>
  implements INotificationRecipientRepository
{
  protected readonly _model = NotificationRecipientModel;
  protected readonly _mapper = NotificationRecipientMapper;

  async bulkCreate(recipients: NotificationRecipient[]): Promise<NotificationRecipient[]> {
    if (!recipients.length) return [];

    const persistenceDocs = recipients.map((r) => NotificationRecipientMapper.toPersistence(r));

    try {
      const createdDocs = await NotificationRecipientModel.insertMany(persistenceDocs, {
        ordered: false,
      });
      return createdDocs.map((doc) => NotificationRecipientMapper.toDomain(doc));
    } catch (err: any) {
      if (err.insertedDocs && err.insertedDocs.length) {
        return err.insertedDocs.map((doc: any) => NotificationRecipientMapper.toDomain(doc));
      }
      return [];
    }
  }

  async findByUserId(
    userId: string,
    pagination: RecipientPagination,
    search?: string
  ): Promise<RecipientListResult> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    }

    const matchQuery: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    const populateOptions = {
      path: 'notificationId',
      match: { isDeleted: false },
      populate: { path: 'createdBy', select: 'name role email' },
    };

    const [docs, total] = await Promise.all([
      NotificationRecipientModel.find(matchQuery)
        .populate(populateOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      NotificationRecipientModel.countDocuments(matchQuery),
    ]);

    const validDocs = docs.filter((doc) => doc.notificationId !== null);

    let domainEntities = validDocs.map((doc) => NotificationRecipientMapper.toDomain(doc));

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      domainEntities = domainEntities.filter(
        (e) =>
          (e.notificationTitle && regex.test(e.notificationTitle)) ||
          (e.notificationMessage && regex.test(e.notificationMessage))
      );
    }

    return {
      recipients: domainEntities,
      total,
    };
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return NotificationRecipientModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: { $ne: NotificationStatus.READ },
    });
  }

  async findByNotificationAndUser(
    notificationId: string,
    userId: string
  ): Promise<NotificationRecipient | null> {
    const doc = await NotificationRecipientModel.findOne({
      notificationId: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    }).populate({
      path: 'notificationId',
      populate: { path: 'createdBy', select: 'name role email' },
    });

    if (!doc) return null;
    return NotificationRecipientMapper.toDomain(doc);
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await NotificationRecipientModel.updateOne(
      {
        notificationId: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ },
      },
      {
        $set: {
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await NotificationRecipientModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ },
      },
      {
        $set: {
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  async resolveRecipientIds(
    targetType: NotificationTargetType,
    targetIds: string[],
    authorId?: string
  ): Promise<string[]> {
    const userIdsSet = new Set<string>();

    if (targetType === NotificationTargetType.ALL) {
      const recipients = await UserModel.find({
        role: { $in: [UserRole.TEACHER, UserRole.STUDENT] },
      }).select('_id');
      recipients.forEach((u) => userIdsSet.add(u._id.toString()));
    } else if (targetType === NotificationTargetType.USER) {
      targetIds.forEach((id) => userIdsSet.add(id));
    } else if (
      targetType === NotificationTargetType.BATCH ||
      targetType === NotificationTargetType.COURSE ||
      targetType === NotificationTargetType.CENTER
    ) {
      let batchIds: unknown[] = targetIds;

      if (targetType !== NotificationTargetType.BATCH) {
        const batchFilterField =
          targetType === NotificationTargetType.COURSE ? 'courseId' : 'centerId';
        const batches = await BatchModel.find({
          [batchFilterField]: { $in: targetIds },
          isDeleted: { $ne: true },
        }).select('_id');
        batchIds = batches.map((b) => b._id);
      }

      if (batchIds.length > 0) {
        const students = await StudentModel.find({
          batchId: { $in: batchIds },
          isDeleted: { $ne: true },
        }).select('userId');
        students.forEach((s) => {
          if (s.userId) userIdsSet.add(s.userId.toString());
        });
      }
    }

    if (authorId) {
      userIdsSet.delete(authorId.toString());
    }

    return Array.from(userIdsSet);
  }
}
