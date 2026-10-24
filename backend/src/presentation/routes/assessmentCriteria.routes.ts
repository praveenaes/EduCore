import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { AssessmentCriteriaController } from "@/presentation/controllers/assessment-criteria/AssessmentCriteria.controller";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getAssessmentCriteriaRoutes = (container: Container): Router => {
  const router = Router();
  const criteriaController = container.get<AssessmentCriteriaController>(
    TYPES.AssessmentCriteriaController
  );

  router
    .route(API_ROUTES.ASSESSMENT_CRITERIA.LIST)
    .get(authenticateUser, asyncHandler(criteriaController.getAll.bind(criteriaController)))
    .post(authenticateAdmin, asyncHandler(criteriaController.create.bind(criteriaController)));

  router
    .route(API_ROUTES.ASSESSMENT_CRITERIA.DETAIL)
    .put(authenticateAdmin, asyncHandler(criteriaController.update.bind(criteriaController)))
    .delete(authenticateAdmin, asyncHandler(criteriaController.delete.bind(criteriaController)));

  return router;
};
