import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../../../config/di/types";
import { StudentController } from "../../../../presentation/controllers/students/Student.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "../handler/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getStudentRoutes = (container: Container): Router => {
  const router = Router();
  const studentController = container.get<StudentController>(TYPES.StudentController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.STUDENTS.LIST)
    .get(asyncHandler(studentController.getAll.bind(studentController)));

  router
    .route(API_ROUTES.STUDENTS.LIST)
    .post(upload.single("photo"), asyncHandler(studentController.register.bind(studentController)));
  
  router
    .route(API_ROUTES.STUDENTS.EXPORT)
    .get(asyncHandler(studentController.exportCsv.bind(studentController)));

  router
    .route(API_ROUTES.STUDENTS.STATUS)
    .patch(asyncHandler(studentController.toggleStatus.bind(studentController)));

  router
    .route("/:id")
    .put(upload.single("photo"), asyncHandler(studentController.update.bind(studentController)))
    .delete(asyncHandler(studentController.delete.bind(studentController)));

  return router;
};
