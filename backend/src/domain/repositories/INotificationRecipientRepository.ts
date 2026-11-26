import { NotificationRecipient } from '../entities/NotificationRecipient';
import { NotificationTargetType } from '../enums/NotificationEnums';
import { IBaseRepository } from './IBaseRepository';

export interface RecipientPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RecipientListResult {
  recipients: NotificationRecipient[];
  total: number;
}

export interface INotificationRecipientRepository extends IBaseRepository<NotificationRecipient> {
  bulkCreate(recipients: NotificationRecipient[]): Promise<NotificationRecipient[]>;
  findByUserId(userId: string, pagination: RecipientPagination, search?: string): Promise<RecipientListResult>;
  countUnreadByUserId(userId: string): Promise<number>;
  findByNotificationAndUser(notificationId: string, userId: string): Promise<NotificationRecipient | null>;
  markAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  resolveRecipientIds(
    targetType: NotificationTargetType,
    targetIds: string[],
    authorId?: string
  ): Promise<string[]>;
}
