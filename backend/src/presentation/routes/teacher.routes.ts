import { Router } from "express";
import { Container } from "inversify";
import { TeacherController } from "@/presentation/controllers/teachers/Teacher.controller";
import { TYPES } from "@/config/di/types";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware";

export const getTeacherRoutes = (container: Container): Router => {
  const router = Router();
  const teacherController = container.get<TeacherController>(TYPES.TeacherController);

  // Teacher self-service route
  router.get(
    "/me/curriculum",
    authenticateUser,
    asyncHandler(teacherController.getCurriculum.bind(teacherController))
  );

  router.use(authenticateAdmin);

  router
    .route("/")
    .get(asyncHandler(teacherController.getAll.bind(teacherController)));

  router
    .route("/")
    .post(upload.single("photo"), asyncHandler(teacherController.register.bind(teacherController)));

  router
    .route(API_ROUTES.TEACHERS.EXPORT)
    .get(asyncHandler(teacherController.exportCsv.bind(teacherController)));

  router
    .route(API_ROUTES.TEACHERS.STATUS)
    .patch(asyncHandler(teacherController.toggleStatus.bind(teacherController)));

  router
    .route("/:id")
    .put(upload.single("photo"), asyncHandler(teacherController.update.bind(teacherController)))
    .delete(asyncHandler(teacherController.delete.bind(teacherController)));

  return router;
};
