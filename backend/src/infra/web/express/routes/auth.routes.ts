import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { AuthController } from "@/presentation/controllers/auth/Auth.controller";
import { API_ROUTES } from "@/config/routes.config";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";
import { asyncHandler } from "../handler/asyncHandler";

export const getAuthRoutes = (container: Container): Router => {
  const router = Router();
  const authController = container.get<AuthController>(TYPES.AuthController);

  router
    .route(API_ROUTES.AUTH.LOGIN)
    .post(asyncHandler(authController.login.bind(authController)));

  router
    .route(API_ROUTES.AUTH.LOGOUT)
    .post(asyncHandler(authController.logout.bind(authController)));

  router
    .route(API_ROUTES.AUTH.FORGOT_PASSWORD)
    .post(asyncHandler(authController.forgotPassword.bind(authController)));

  router
    .route("/refresh")
    .post(asyncHandler(authController.refresh.bind(authController)));

  router
    .route("/me")
    .get(authenticateUser, asyncHandler(authController.me.bind(authController)));

  router
    .route(API_ROUTES.AUTH.VERIFY_OTP)
    .post(asyncHandler(authController.verifyOtp.bind(authController)));

  router
    .route(API_ROUTES.AUTH.RESET_PASSWORD)
    .post(asyncHandler(authController.resetPassword.bind(authController)));

  return router;
};
