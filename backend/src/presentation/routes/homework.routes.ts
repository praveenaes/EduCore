import { Router } from "express";
import { Container } from "inversify";
import { HomeworkController } from "@/presentation/controllers/homework/Homework.controller";
import { TYPES } from "@/config/di/types";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";
import { authenticateUser } from "../middleware/authMiddleware";

export const getHomeworkRoutes = (container: Container): Router => {
  const router = Router();
  const homeworkController = container.get<HomeworkController>(TYPES.HomeworkController);

  router.use(authenticateUser);

  // Student routes (declared before /:id to avoid collision)
  router
    .route(API_ROUTES.HOMEWORK.STUDENT)
    .get(asyncHandler(homeworkController.getStudentHomeworks.bind(homeworkController)));

  router
    .route(API_ROUTES.HOMEWORK.STUDENT_SUBMIT)
    .post(asyncHandler(homeworkController.submitHomework.bind(homeworkController)));

  router
    .route(API_ROUTES.HOMEWORK.STUDENT_EXTENSION)
    .post(asyncHandler(homeworkController.requestExtension.bind(homeworkController)));

  // Teacher collection routes
  router
    .route(API_ROUTES.HOMEWORK.LIST)
    .get(asyncHandler(homeworkController.getTeacherHomeworks.bind(homeworkController)))
    .post(asyncHandler(homeworkController.createHomework.bind(homeworkController)));

  // Submissions and reviews
  router
    .route(API_ROUTES.HOMEWORK.SUBMISSIONS)
    .get(asyncHandler(homeworkController.getHomeworkSubmissions.bind(homeworkController)));

  router
    .route(API_ROUTES.HOMEWORK.REVIEW_EXTENSION)
    .patch(asyncHandler(homeworkController.reviewExtension.bind(homeworkController)));

  router
    .route(API_ROUTES.HOMEWORK.REVIEW)
    .post(asyncHandler(homeworkController.reviewSubmission.bind(homeworkController)));

  // Homework details (update / soft delete)
  router
    .route(API_ROUTES.HOMEWORK.DETAIL)
    .put(asyncHandler(homeworkController.updateHomework.bind(homeworkController)))
    .delete(asyncHandler(homeworkController.deleteHomework.bind(homeworkController)));

  return router;
};
