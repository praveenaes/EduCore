import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { SettingsController } from "@/presentation/controllers/settings/Settings.controller";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getSettingsRoutes = (container: Container): Router => {
  const router = Router();
  const settingsController = container.get<SettingsController>(TYPES.SettingsController);

  router
    .route(API_ROUTES.SETTINGS.ORGANIZATION)
    .get(asyncHandler(settingsController.getOrganization.bind(settingsController)))
    .put(
      authenticateAdmin,upload.single("logo"),
      asyncHandler(settingsController.updateOrganization.bind(settingsController))
    );

  router
    .route(API_ROUTES.SETTINGS.PROFILE)
    .get(
      authenticateUser,asyncHandler(settingsController.getMySettings.bind(settingsController))
    )
    .patch(
      authenticateUser,upload.single("photo"),
      asyncHandler(settingsController.updateMyProfilePhoto.bind(settingsController))
    );

  router
    .route(API_ROUTES.SETTINGS.CHANGE_PASSWORD)
    .post(
      authenticateUser,asyncHandler(settingsController.changePassword.bind(settingsController))
    );

  router
    .route(API_ROUTES.SETTINGS.CHANGE_EMAIL_SEND_OTP)
    .post(
      authenticateUser,asyncHandler(settingsController.sendEmailChangeOtp.bind(settingsController))
    );

  router
    .route(API_ROUTES.SETTINGS.CHANGE_EMAIL_VERIFY_OTP)
    .post(
      authenticateUser,asyncHandler(settingsController.verifyEmailChangeOtp.bind(settingsController))
    );

  router
    .route(API_ROUTES.SETTINGS.CHANGE_EMAIL_UPDATE)
    .post(
      authenticateUser,asyncHandler(settingsController.changeEmail.bind(settingsController))
    );

  return router;
};
