import { Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { AuthenticatedRequest } from '@/presentation/middleware/authMiddleware';
import { ResponseHelper } from '@/presentation/helpers/ResponseHelper';
import {
  createNotificationSchema,
  getNotificationsQuerySchema,
} from '@/presentation/validators/notificationValidators';
import { ICreateNotificationUseCase } from '@/application/ports/use-cases/notifications/ICreateNotificationUseCase';
import { IGetUserNotificationsUseCase } from '@/application/ports/use-cases/notifications/IGetUserNotificationsUseCase';
import { IGetUnreadCountUseCase } from '@/application/ports/use-cases/notifications/IGetUnreadCountUseCase';
import { IMarkNotificationAsReadUseCase } from '@/application/ports/use-cases/notifications/IMarkNotificationAsReadUseCase';
import { IMarkAllNotificationsAsReadUseCase } from '@/application/ports/use-cases/notifications/IMarkAllNotificationsAsReadUseCase';
import { IGetSentNotificationsUseCase } from '@/application/ports/use-cases/notifications/IGetSentNotificationsUseCase';

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.CreateNotificationUseCase)
    private _createNotificationUseCase: ICreateNotificationUseCase,
    @inject(TYPES.GetUserNotificationsUseCase)
    private _getUserNotificationsUseCase: IGetUserNotificationsUseCase,
    @inject(TYPES.GetUnreadCountUseCase)
    private _getUnreadCountUseCase: IGetUnreadCountUseCase,
    @inject(TYPES.MarkNotificationAsReadUseCase)
    private _markNotificationAsReadUseCase: IMarkNotificationAsReadUseCase,
    @inject(TYPES.MarkAllNotificationsAsReadUseCase)
    private _markAllNotificationsAsReadUseCase: IMarkAllNotificationsAsReadUseCase,
    @inject(TYPES.GetSentNotificationsUseCase)
    private _getSentNotificationsUseCase: IGetSentNotificationsUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = createNotificationSchema.parse(req.body);
    const result = await this._createNotificationUseCase.execute({
      ...validated,
      createdBy: req.user!.id,
    });
    ResponseHelper.created(res, 'Notification created successfully', result);
  };

  getMyNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = getNotificationsQuerySchema.parse(req.query);
    const result = await this._getUserNotificationsUseCase.execute(
      req.user!.id,
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      query.search
    );
    ResponseHelper.success(res, 'Notifications retrieved successfully', result);
  };

  getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this._getUnreadCountUseCase.execute(req.user!.id);
    ResponseHelper.success(res, 'Unread count retrieved successfully', result);
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._markNotificationAsReadUseCase.execute(id, req.user!.id);
    ResponseHelper.success(res, 'Notification marked as read', { id });
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await this._markAllNotificationsAsReadUseCase.execute(req.user!.id);
    ResponseHelper.success(res, 'All notifications marked as read', { count });
  };

  getSent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = getNotificationsQuerySchema.parse(req.query);
    const result = await this._getSentNotificationsUseCase.execute(req.user!.id, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    ResponseHelper.success(res, 'Sent notifications retrieved successfully', result);
  };
}
