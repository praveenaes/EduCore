import { Types } from 'mongoose';
import { NotificationRecipient } from '../../../domain/entities/NotificationRecipient';

export class NotificationRecipientMapper {
  static toDomain(doc: any): NotificationRecipient {
    const notificationId = doc.notificationId?._id
      ? doc.notificationId._id.toString()
      : doc.notificationId?.toString();
    const userId = doc.userId?._id
      ? doc.userId._id.toString()
      : doc.userId?.toString();

    const isPopulatedNotif = doc.notificationId && typeof doc.notificationId === 'object' && doc.notificationId.title;
    const isPopulatedCreator = isPopulatedNotif && doc.notificationId.createdBy && typeof doc.notificationId.createdBy === 'object';

    return new NotificationRecipient({
      id: doc._id.toString(),
      notificationId,
      userId,
      status: doc.status,
      readAt: doc.readAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      notificationTitle: isPopulatedNotif ? doc.notificationId.title : undefined,
      notificationMessage: isPopulatedNotif ? doc.notificationId.message : undefined,
      notificationCreatedAt: isPopulatedNotif ? doc.notificationId.createdAt : undefined,
      createdBy: isPopulatedNotif
        ? (isPopulatedCreator ? doc.notificationId.createdBy._id?.toString() : doc.notificationId.createdBy?.toString())
        : undefined,
      creatorName: isPopulatedCreator ? doc.notificationId.createdBy.name : undefined,
      metadata: isPopulatedNotif ? doc.notificationId.metadata : undefined,
    });
  }

  static toPersistence(entity: NotificationRecipient): Record<string, any> {
    return {
      notificationId: new Types.ObjectId(entity.notificationId),
      userId: new Types.ObjectId(entity.userId),
      status: entity.status,
      readAt: entity.readAt || null,
    };
  }

  static toPersistencePartial(entity: Partial<NotificationRecipient>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.status !== undefined) data.status = entity.status;
    if (entity.readAt !== undefined) data.readAt = entity.readAt;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;
    return data;
  }
}
