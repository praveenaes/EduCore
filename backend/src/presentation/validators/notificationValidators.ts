import { z } from 'zod';
import { DeliveryChannel, NotificationTargetType } from '@/domain/enums/NotificationEnums';

export const createNotificationSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
  deliveryChannel: z.nativeEnum(DeliveryChannel).optional().default(DeliveryChannel.IN_APP),
  targetType: z.nativeEnum(NotificationTargetType),
  targetIds: z.array(z.string().trim()).optional().default([]),
  metadata: z
    .object({
      entityType: z
        .enum(['homework', 'assessment', 'fee', 'attendance', 'general'])
        .optional(),
      entityId: z.string().optional(),
      linkUrl: z.string().optional(),
    })
    .optional(),
});

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
