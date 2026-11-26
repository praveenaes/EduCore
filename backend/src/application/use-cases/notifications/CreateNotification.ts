import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { INotificationRecipientRepository } from '@/domain/repositories/INotificationRecipientRepository';
import { INotificationSocketService } from '@/application/ports/services/INotificationSocketService';
import { ICreateNotificationUseCase } from '@/application/ports/use-cases/notifications/ICreateNotificationUseCase';
import {
  CreateNotificationDTO,
  NotificationResponseDTO,
} from '@/application/dto/notifications/notificationDtos';
import { Notification } from '@/domain/entities/Notification';
import { NotificationRecipient } from '@/domain/entities/NotificationRecipient';

@injectable()
export class CreateNotification implements ICreateNotificationUseCase {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepo: INotificationRepository,
    @inject(TYPES.NotificationRecipientRepository)
    private _recipientRepo: INotificationRecipientRepository,
    @inject(TYPES.NotificationSocketService)
    private _socketService: INotificationSocketService
  ) {}

  async execute(dto: CreateNotificationDTO): Promise<NotificationResponseDTO> {
    const targetUserIds = await this._recipientRepo.resolveRecipientIds(
      dto.targetType,
      dto.targetIds || [],
      dto.createdBy
    );

    const notification = Notification.createNew({
      title: dto.title,
      message: dto.message,
      deliveryChannel: dto.deliveryChannel,
      targetType: dto.targetType,
      targetIds: dto.targetIds,
      createdBy: dto.createdBy,
      metadata: dto.metadata,
    });

    const savedNotification = await this._notificationRepo.create(notification);

    //individually saving the notification
    if (targetUserIds.length > 0) {
      const recipientEntities = targetUserIds.map((userId) =>
        NotificationRecipient.createNew({
          notificationId: savedNotification.id!,
          userId,
        })
      );

      await this._recipientRepo.bulkCreate(recipientEntities);

      this._socketService.sendToUsers(targetUserIds, 'new_notification', {
        id: savedNotification.id,
        title: savedNotification.title,
        message: savedNotification.message,
        createdAt: savedNotification.createdAt,
        metadata: savedNotification.metadata,
        createdBy: dto.createdBy,
      });
    }

    return {
      id: savedNotification.id!,
      title: savedNotification.title,
      message: savedNotification.message,
      deliveryChannel: savedNotification.deliveryChannel,
      targetType: savedNotification.targetType,
      targetIds: savedNotification.targetIds,
      createdBy: savedNotification.createdBy,
      metadata: savedNotification.metadata,
      isActive: savedNotification.isActive,
      isDeleted: savedNotification.isDeleted,
      createdAt: savedNotification.createdAt?.toISOString(),
      updatedAt: savedNotification.updatedAt?.toISOString(),
    };
  }
}