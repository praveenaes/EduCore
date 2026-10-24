import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { AssessmentScheduleController } from "@/presentation/controllers/assessment-schedules/AssessmentSchedule.controller";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getAssessmentScheduleRoutes = (container: Container): Router => {
  const router = Router();
  const scheduleController = container.get<AssessmentScheduleController>(
    TYPES.AssessmentScheduleController
  );

  router
    .route(API_ROUTES.ASSESSMENT_SCHEDULES.LIST)
    .get(authenticateUser, asyncHandler(scheduleController.getAll.bind(scheduleController)))
    .post(authenticateAdmin, asyncHandler(scheduleController.create.bind(scheduleController)));

  router
    .route(API_ROUTES.ASSESSMENT_SCHEDULES.DETAIL)
    .put(authenticateAdmin, asyncHandler(scheduleController.update.bind(scheduleController)))
    .delete(authenticateAdmin, asyncHandler(scheduleController.delete.bind(scheduleController)));

  router
    .route(API_ROUTES.ASSESSMENT_SCHEDULES.TOGGLE_STATUS)
    .patch(authenticateAdmin, asyncHandler(scheduleController.toggleStatus.bind(scheduleController)));

  return router;
};
