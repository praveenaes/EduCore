import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { CenterController } from "../controllers/centers/Center.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getCenterRoutes = (container: Container): Router => {
  const router = Router();
  const centerController = container.get<CenterController>(TYPES.CenterController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.CENTERS.LIST)
    .get(asyncHandler(centerController.getAll.bind(centerController)))
    .post(asyncHandler(centerController.create.bind(centerController)));

  router
    .route(API_ROUTES.CENTERS.DETAIL)
    .put(asyncHandler(centerController.update.bind(centerController)))
    .delete(asyncHandler(centerController.delete.bind(centerController)));

  return router;
};
