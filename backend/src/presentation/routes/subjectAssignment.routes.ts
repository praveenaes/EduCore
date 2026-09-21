import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { SubjectAssignmentController } from "@/presentation/controllers/subject-assignments/SubjectAssignment.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getSubjectAssignmentRoutes = (container: Container): Router => {
  const router = Router();
  const controller = container.get<SubjectAssignmentController>(TYPES.SubjectAssignmentController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.SUBJECT_ASSIGNMENTS.LIST)
    .get(asyncHandler(controller.getAll.bind(controller)))
    .post(asyncHandler(controller.create.bind(controller)));

  router
    .route(API_ROUTES.SUBJECT_ASSIGNMENTS.DETAIL)
    .put(asyncHandler(controller.update.bind(controller)))
    .delete(asyncHandler(controller.delete.bind(controller)));

  return router;
};
