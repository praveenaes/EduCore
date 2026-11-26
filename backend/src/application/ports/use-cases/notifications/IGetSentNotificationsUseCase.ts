import { NotificationListResultDTO } from '@/application/dto/notifications/notificationDtos';
import { NotificationPagination } from '@/domain/repositories/INotificationRepository';

export interface IGetSentNotificationsUseCase {
  execute(creatorId: string, pagination: NotificationPagination): Promise<NotificationListResultDTO>;
}
