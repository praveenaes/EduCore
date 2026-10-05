import { Router } from "express";
import { Container } from "inversify";
import { LeaveController } from "@/presentation/controllers/leave/Leave.controller";
import { TYPES } from "@/config/di/types";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";
import { authenticateUser } from "../middleware/authMiddleware";

export const getLeaveRoutes = (container: Container): Router => {
  const router = Router();
  const leaveController = container.get<LeaveController>(TYPES.LeaveController);

  router.use(authenticateUser);

  // Student routes: apply leave (POST) and get student leaves (GET)
  router
    .route(API_ROUTES.LEAVES.STUDENT)
    .post(asyncHandler(leaveController.applyLeave.bind(leaveController)))
    .get(asyncHandler(leaveController.getStudentLeaves.bind(leaveController)));

  // Teacher route: get batch leaves (GET)
  router
    .route(API_ROUTES.LEAVES.BATCH)
    .get(asyncHandler(leaveController.getBatchLeaves.bind(leaveController)));

  // Teacher route: review leave request (PATCH)
  router
    .route(API_ROUTES.LEAVES.REVIEW)
    .patch(asyncHandler(leaveController.reviewLeave.bind(leaveController)));

  return router;
};
