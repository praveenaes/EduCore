import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { AssessmentResultController } from "@/presentation/controllers/assessment-results/AssessmentResult.controller";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getAssessmentResultRoutes = (container: Container): Router => {
  const router = Router();
  const controller = container.get<AssessmentResultController>(TYPES.AssessmentResultController);

  router.use(authenticateUser);

  // Student specific endpoints
  router
    .route(API_ROUTES.ASSESSMENT_RESULTS.MY_RESULTS)
    .get(asyncHandler(controller.getMyResults.bind(controller)));

  router
    .route(API_ROUTES.ASSESSMENT_RESULTS.MY_REPORT_CARD)
    .get(asyncHandler(controller.getMyReportCard.bind(controller)));

  router
    .route(API_ROUTES.ASSESSMENT_RESULTS.STUDENT_REPORT_CARD)
    .get(asyncHandler(controller.getStudentReportCard.bind(controller)));

  // Mark entry sheet & publishing
  router
    .route(API_ROUTES.ASSESSMENT_RESULTS.SHEET)
    .get(asyncHandler(controller.getMarkEntrySheet.bind(controller)));

  router
    .route(API_ROUTES.ASSESSMENT_RESULTS.PUBLISH)
    .post(authenticateAdmin, asyncHandler(controller.publishResults.bind(controller)));

  // General marks save and query
  router
    .route(API_ROUTES.ASSESSMENT_RESULTS.LIST)
    .get(asyncHandler(controller.getAll.bind(controller)))
    .post(asyncHandler(controller.saveMarks.bind(controller)));

  return router;
};
