import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { SubjectController } from "@/presentation/controllers/subjects/Subject.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getSubjectRoutes = (container: Container): Router => {
  const router = Router();
  const subjectController = container.get<SubjectController>(TYPES.SubjectController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.SUBJECTS.LIST)
    .get(asyncHandler(subjectController.getAll.bind(subjectController)))
    .post(asyncHandler(subjectController.create.bind(subjectController)));

  router
    .route(API_ROUTES.SUBJECTS.DETAIL)
    .put(asyncHandler(subjectController.update.bind(subjectController)))
    .delete(asyncHandler(subjectController.delete.bind(subjectController)));

  return router;
};
