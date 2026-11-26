import { Types } from 'mongoose';
import { Notification } from '../../../domain/entities/Notification';

export class NotificationMapper {
  static toDomain(doc: any): Notification {
    const createdBy = doc.createdBy?._id
      ? doc.createdBy._id.toString()
      : doc.createdBy?.toString();

    return new Notification({
      id: doc._id.toString(),
      title: doc.title,
      message: doc.message,
      deliveryChannel: doc.deliveryChannel,
      targetType: doc.targetType,
      targetIds: doc.targetIds || [],
      createdBy,
      metadata: doc.metadata,
      isActive: Boolean(doc.isActive),
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      creatorName: doc.createdBy?.name,
      creatorRole: doc.createdBy?.role,
    });
  }

  static toPersistence(entity: Notification): Record<string, any> {
    return {
      title: entity.title,
      message: entity.message,
      deliveryChannel: entity.deliveryChannel,
      targetType: entity.targetType,
      targetIds: entity.targetIds,
      createdBy: new Types.ObjectId(entity.createdBy),
      metadata: entity.metadata,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<Notification>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.title !== undefined) data.title = entity.title;
    if (entity.message !== undefined) data.message = entity.message;
    if (entity.deliveryChannel !== undefined) data.deliveryChannel = entity.deliveryChannel;
    if (entity.targetType !== undefined) data.targetType = entity.targetType;
    if (entity.targetIds !== undefined) data.targetIds = entity.targetIds;
    if (entity.metadata !== undefined) data.metadata = entity.metadata;
    if (entity.isActive !== undefined) data.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;
    return data;
  }
}
