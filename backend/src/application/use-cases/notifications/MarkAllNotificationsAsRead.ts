import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { INotificationRecipientRepository } from '@/domain/repositories/INotificationRecipientRepository';
import { IMarkAllNotificationsAsReadUseCase } from '@/application/ports/use-cases/notifications/IMarkAllNotificationsAsReadUseCase';

@injectable()
export class MarkAllNotificationsAsRead implements IMarkAllNotificationsAsReadUseCase {
  constructor(
    @inject(TYPES.NotificationRecipientRepository)
    private _recipientRepo: INotificationRecipientRepository
  ) {}

  async execute(userId: string): Promise<number> {
    return this._recipientRepo.markAllAsRead(userId);
  }
}
