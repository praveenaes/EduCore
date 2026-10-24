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
import { getAttendanceRoutes } from "./attendance.routes";
import { getHomeworkRoutes } from "./homework.routes";
import { getLeaveRoutes } from "./leave.routes";
import { getAssessmentRoutes } from "./assessment.routes";
import { getAssessmentCriteriaRoutes } from "./assessmentCriteria.routes";
import { getAssessmentScheduleRoutes } from "./assessmentSchedule.routes";
import { getAssessmentResultRoutes } from "./assessmentResult.routes";

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
router.use(API_ROUTES.ATTENDANCE.ROOT, getAttendanceRoutes(container));
router.use(API_ROUTES.HOMEWORK.ROOT, getHomeworkRoutes(container));
router.use(API_ROUTES.LEAVES.ROOT, getLeaveRoutes(container));
router.use(API_ROUTES.ASSESSMENT_CRITERIA.ROOT, getAssessmentCriteriaRoutes(container));
router.use(API_ROUTES.ASSESSMENT_SCHEDULES.ROOT, getAssessmentScheduleRoutes(container));
router.use(API_ROUTES.ASSESSMENT_RESULTS.ROOT, getAssessmentResultRoutes(container));
router.use(API_ROUTES.ASSESSMENTS.ROOT, getAssessmentRoutes(container));


export default router;
