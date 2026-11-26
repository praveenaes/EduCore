export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type NotificationTargetType = 'ALL' | 'CENTER' | 'COURSE' | 'BATCH' | 'USER';

export interface NotificationItem {
  id: string;
  notificationId: string;
  userId: string;
  status: NotificationStatus;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  notificationTitle?: string;
  notificationMessage?: string;
  notificationCreatedAt?: string;
  createdBy?: string;
  creatorName?: string;
  metadata?: {
    entityType?: 'homework' | 'assessment' | 'fee' | 'attendance' | 'general';
    entityId?: string;
    linkUrl?: string;
  };
}

export interface NotificationRecipientListResponse {
  success: boolean;
  message: string;
  data: {
    recipients: NotificationItem[];
    total: number;
    unreadCount?: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  deliveryChannel?: DeliveryChannel;
  targetType: NotificationTargetType;
  targetIds?: string[];
  metadata?: {
    entityType?: 'homework' | 'assessment' | 'fee' | 'attendance' | 'general';
    entityId?: string;
    linkUrl?: string;
  };
}
