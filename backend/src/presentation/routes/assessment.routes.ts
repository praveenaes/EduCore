import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { AssessmentController } from "@/presentation/controllers/assessments/Assessment.controller";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getAssessmentRoutes = (container: Container): Router => {
  const router = Router();
  const assessmentController = container.get<AssessmentController>(TYPES.AssessmentController);

  router
    .route(API_ROUTES.ASSESSMENTS.LIST)
    .get(authenticateUser, asyncHandler(assessmentController.getAll.bind(assessmentController)))
    .post(authenticateAdmin, asyncHandler(assessmentController.create.bind(assessmentController)));

  router
    .route(API_ROUTES.ASSESSMENTS.DETAIL)
    .put(authenticateAdmin, asyncHandler(assessmentController.update.bind(assessmentController)))
    .delete(authenticateAdmin, asyncHandler(assessmentController.delete.bind(assessmentController)));

  return router;
};
