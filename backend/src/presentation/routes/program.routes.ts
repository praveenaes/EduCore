import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { ProgramController } from "@/presentation/controllers/programs/Program.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getProgramRoutes = (container: Container): Router => {
  const router = Router();
  const programController = container.get<ProgramController>(TYPES.ProgramController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.PROGRAMS.LIST)
    .get(asyncHandler(programController.getAll.bind(programController)))
    .post(asyncHandler(programController.create.bind(programController)));

  router
    .route(API_ROUTES.PROGRAMS.DETAIL)
    .put(asyncHandler(programController.update.bind(programController)))
    .delete(asyncHandler(programController.delete.bind(programController)));

  return router;
};