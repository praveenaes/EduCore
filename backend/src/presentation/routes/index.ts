import { Router } from "express";
import { container } from "@/config/di/container";
import { API_ROUTES } from "@/config/routes.config";
import { logger } from "@/infra/logger/logger";
import { getAuthRoutes } from "./auth.routes";
import { getStudentRoutes } from "./student.routes";
import { getTeacherRoutes } from "./teacher.routes";
import { getSettingsRoutes } from "./settings.routes";
import { getProgramRoutes } from "./program.routes";
import { getCourseRoutes } from "./course.routes";
import { getSubjectRoutes } from "./subject.routes";
import { getCenterRoutes } from "./center.routes";
import { getAcademicYearRoutes } from "./academicYear.routes";
import { getSubjectAssignmentRoutes } from "./subjectAssignment.routes";
import { getBatchRoutes } from "./batch.routes";

const router = Router();

router.use((req, res, next) => {
  logger.debug("Incoming request body", {
    path: req.path,
    method: req.method,
    bodyKeys: Object.keys(req.body || {}),
  });
  next();
});
//debug-Because request-body inspection is usually considered development/debugging information.

router.use(API_ROUTES.AUTH.ROOT, getAuthRoutes(container));
router.use(API_ROUTES.STUDENTS.ROOT, getStudentRoutes(container));
router.use(API_ROUTES.TEACHERS.ROOT, getTeacherRoutes(container));
router.use(API_ROUTES.SETTINGS.ROOT, getSettingsRoutes(container));
router.use(API_ROUTES.PROGRAMS.ROOT, getProgramRoutes(container));
router.use(API_ROUTES.COURSES.ROOT, getCourseRoutes(container));
router.use(API_ROUTES.SUBJECTS.ROOT, getSubjectRoutes(container));
router.use(API_ROUTES.CENTERS.ROOT, getCenterRoutes(container));
router.use(API_ROUTES.ACADEMIC_YEARS.ROOT, getAcademicYearRoutes(container));
router.use(API_ROUTES.SUBJECT_ASSIGNMENTS.ROOT, getSubjectAssignmentRoutes(container));
router.use(API_ROUTES.BATCHES.ROOT, getBatchRoutes(container));

export default router;
