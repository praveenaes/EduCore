import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { NotificationController } from "@/presentation/controllers/notifications/Notification.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getNotificationRoutes = (container: Container): Router => {
  const router = Router();
  const notificationController = container.get<NotificationController>(TYPES.NotificationController);

  router.use(authenticateUser);

  router
    .route(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT)
    .get(asyncHandler(notificationController.getUnreadCount.bind(notificationController)));

  router
    .route(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ)
    .patch(asyncHandler(notificationController.markAllAsRead.bind(notificationController)));

  router
    .route(API_ROUTES.NOTIFICATIONS.SENT)
    .get(asyncHandler(notificationController.getSent.bind(notificationController)));

  router
    .route(API_ROUTES.NOTIFICATIONS.LIST)
    .get(asyncHandler(notificationController.getMyNotifications.bind(notificationController)))
    .post(asyncHandler(notificationController.create.bind(notificationController)));

  router
    .route(API_ROUTES.NOTIFICATIONS.MARK_READ)
    .patch(asyncHandler(notificationController.markAsRead.bind(notificationController)));

  return router;
};
