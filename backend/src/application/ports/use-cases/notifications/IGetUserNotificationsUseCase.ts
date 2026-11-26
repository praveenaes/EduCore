import { RecipientListResultDTO } from '@/application/dto/notifications/notificationDtos';
import { RecipientPagination } from '@/domain/repositories/INotificationRecipientRepository';

export interface IGetUserNotificationsUseCase {
  execute(userId: string, pagination: RecipientPagination, search?: string): Promise<RecipientListResultDTO>;
}
