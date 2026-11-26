import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { INotificationRecipientRepository } from '@/domain/repositories/INotificationRecipientRepository';
import { IGetUnreadCountUseCase } from '@/application/ports/use-cases/notifications/IGetUnreadCountUseCase';
import { UnreadCountResponseDTO } from '@/application/dto/notifications/notificationDtos';

@injectable()
export class GetUnreadCount implements IGetUnreadCountUseCase {
  constructor(
    @inject(TYPES.NotificationRecipientRepository)
    private _recipientRepo: INotificationRecipientRepository
  ) {}

  async execute(userId: string): Promise<UnreadCountResponseDTO> {
    const unreadCount = await this._recipientRepo.countUnreadByUserId(userId);
    return { unreadCount };
  }
}
