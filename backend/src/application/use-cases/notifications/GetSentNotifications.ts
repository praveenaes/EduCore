import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  INotificationRepository,
  NotificationPagination,
} from '@/domain/repositories/INotificationRepository';
import { IGetSentNotificationsUseCase } from '@/application/ports/use-cases/notifications/IGetSentNotificationsUseCase';
import {
  NotificationListResultDTO,
  NotificationResponseDTO,
} from '@/application/dto/notifications/notificationDtos';

@injectable()
export class GetSentNotifications implements IGetSentNotificationsUseCase {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepo: INotificationRepository
  ) {}

  async execute(
    creatorId: string,
    pagination: NotificationPagination
  ): Promise<NotificationListResultDTO> {
    const result = await this._notificationRepo.findByCreator(creatorId, pagination);

    const notificationsDTO: NotificationResponseDTO[] = result.notifications.map((n) => ({
      id: n.id!,
      title: n.title,
      message: n.message,
      deliveryChannel: n.deliveryChannel,
      targetType: n.targetType,
      targetIds: n.targetIds,
      createdBy: n.createdBy,
      creatorName: n.creatorName,
      creatorRole: n.creatorRole,
      metadata: n.metadata,
      isActive: n.isActive,
      isDeleted: n.isDeleted,
      createdAt: n.createdAt?.toISOString(),
      updatedAt: n.updatedAt?.toISOString(),
    }));

    return {
      notifications: notificationsDTO,
      total: result.total,
    };
  }
}
