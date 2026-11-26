import { DeliveryChannel, NotificationTargetType } from '@/domain/enums/NotificationEnums';

export interface CreateNotificationDTO {
  title: string;
  message: string;
  deliveryChannel?: DeliveryChannel;
  targetType: NotificationTargetType;
  targetIds?: string[];
  createdBy: string;
  metadata?: {
    entityType?: 'homework' | 'assessment' | 'fee' | 'attendance' | 'general';
    entityId?: string;
    linkUrl?: string;
  };
}

export interface NotificationResponseDTO {
  id: string;
  title: string;
  message: string;
  deliveryChannel: string;
  targetType: string;
  targetIds: string[];
  createdBy: string;
  creatorName?: string;
  creatorRole?: string;
  metadata?: {
    entityType?: string;
    entityId?: string;
    linkUrl?: string;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationRecipientResponseDTO {
  id: string;
  notificationId: string;
  userId: string;
  status: string;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  notificationTitle?: string;
  notificationMessage?: string;
  notificationCreatedAt?: string;
  createdBy?: string;
  creatorName?: string;
  metadata?: {
    entityType?: string;
    entityId?: string;
    linkUrl?: string;
  };
}

export interface NotificationListResultDTO {
  notifications: NotificationResponseDTO[];
  total: number;
}

export interface RecipientListResultDTO {
  recipients: NotificationRecipientResponseDTO[];
  total: number;
  unreadCount?: number;
}

export interface UnreadCountResponseDTO {
  unreadCount: number;
}
