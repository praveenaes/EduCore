import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { INotificationRecipientRepository } from '@/domain/repositories/INotificationRecipientRepository';
import { IMarkNotificationAsReadUseCase } from '@/application/ports/use-cases/notifications/IMarkNotificationAsReadUseCase';

@injectable()
export class MarkNotificationAsRead implements IMarkNotificationAsReadUseCase {
  constructor(
    @inject(TYPES.NotificationRecipientRepository)
    private _recipientRepo: INotificationRecipientRepository
  ) {}

  async execute(notificationId: string, userId: string): Promise<boolean> {
    return this._recipientRepo.markAsRead(notificationId, userId);
  }
}
