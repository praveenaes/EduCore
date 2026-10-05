import { Router } from "express";
import { Container } from "inversify";
import { AttendanceController } from "@/presentation/controllers/attendance/Attendance.controller";
import { TYPES } from "@/config/di/types";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";
import { authenticateUser } from "../middleware/authMiddleware";

export const getAttendanceRoutes = (container: Container): Router => {
  const router = Router();
  const attendanceController = container.get<AttendanceController>(TYPES.AttendanceController);

  router.use(authenticateUser);

  //for teacher
  router
    .route(API_ROUTES.ATTENDANCE.STUDENTS)
    .get(asyncHandler(attendanceController.getBatchAttendance.bind(attendanceController)))
    .post(asyncHandler(attendanceController.createBatchAttendance.bind(attendanceController)))
    .put(asyncHandler(attendanceController.updateBatchAttendance.bind(attendanceController)));

  //for student
  router
    .route(API_ROUTES.ATTENDANCE.STUDENT)
    .get(asyncHandler(attendanceController.getStudentAttendance.bind(attendanceController)));

  return router;
};
