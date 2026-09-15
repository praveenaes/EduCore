import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '@/config/di/types';
import { AcademicYearController } from '../controllers/academic-years/AcademicYear.controller';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { asyncHandler } from '@/presentation/helpers/asyncHandler';
import { API_ROUTES } from '@/config/routes.config';

export const getAcademicYearRoutes = (container: Container): Router => {
  const router = Router();
  const academicYearController = container.get<AcademicYearController>(TYPES.AcademicYearController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.ACADEMIC_YEARS.LIST)
    .get(asyncHandler(academicYearController.getAll.bind(academicYearController)))
    .post(asyncHandler(academicYearController.create.bind(academicYearController)));

  router
    .route(API_ROUTES.ACADEMIC_YEARS.DETAIL)
    .put(asyncHandler(academicYearController.update.bind(academicYearController)))
    .delete(asyncHandler(academicYearController.delete.bind(academicYearController)));

  return router;
};
