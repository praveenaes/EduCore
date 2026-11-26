import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  INotificationRecipientRepository,
  RecipientPagination,
} from '@/domain/repositories/INotificationRecipientRepository';
import { IGetUserNotificationsUseCase } from '@/application/ports/use-cases/notifications/IGetUserNotificationsUseCase';
import {
  RecipientListResultDTO,
  NotificationRecipientResponseDTO,
} from '@/application/dto/notifications/notificationDtos';

@injectable()
export class GetUserNotifications implements IGetUserNotificationsUseCase {
  constructor(
    @inject(TYPES.NotificationRecipientRepository)
    private _recipientRepo: INotificationRecipientRepository
  ) {}

  async execute(
    userId: string,
    pagination: RecipientPagination,
    search?: string
  ): Promise<RecipientListResultDTO> {
    const [result, unreadCount] = await Promise.all([
      this._recipientRepo.findByUserId(userId, pagination, search),
      this._recipientRepo.countUnreadByUserId(userId),
    ]);

    const recipientsDTO: NotificationRecipientResponseDTO[] = result.recipients.map((r) => ({
      id: r.id!,
      notificationId: r.notificationId,
      userId: r.userId,
      status: r.status,
      readAt: r.readAt?.toISOString() || null,
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
      notificationTitle: r.notificationTitle,
      notificationMessage: r.notificationMessage,
      notificationCreatedAt: r.notificationCreatedAt?.toISOString(),
      createdBy: r.createdBy,
      creatorName: r.creatorName,
      metadata: r.metadata,
    }));

    return {
      recipients: recipientsDTO,
      total: result.total,
      unreadCount,
    };
  }
}
