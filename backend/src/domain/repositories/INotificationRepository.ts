import { Notification } from '../entities/Notification';
import { IBaseRepository } from './IBaseRepository';

export interface NotificationFilters {
  createdBy?: string;
  search?: string;
  targetType?: string;
  isActive?: boolean;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationListResult {
  notifications: Notification[];
  total: number;
}

export interface INotificationRepository extends IBaseRepository<Notification> {
  findByCreator(creatorId: string, pagination: NotificationPagination): Promise<NotificationListResult>;
  findAll(filters: NotificationFilters, pagination: NotificationPagination): Promise<NotificationListResult>;
}
