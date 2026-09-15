import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { CourseController } from "@/presentation/controllers/courses/Course.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getCourseRoutes = (container: Container): Router => {
  const router = Router();
  const courseController = container.get<CourseController>(TYPES.CourseController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.COURSES.LIST)
    .get(asyncHandler(courseController.getAll.bind(courseController)))
    .post(asyncHandler(courseController.create.bind(courseController)));

  router
    .route(API_ROUTES.COURSES.DETAIL)
    .put(asyncHandler(courseController.update.bind(courseController)))
    .delete(asyncHandler(courseController.delete.bind(courseController)));

  return router;
};
