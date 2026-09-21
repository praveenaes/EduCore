import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { BatchController } from "@/presentation/controllers/batches/Batch.controller";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "@/presentation/helpers/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";

export const getBatchRoutes = (container: Container): Router => {
  const router = Router();
  const batchController = container.get<BatchController>(TYPES.BatchController);

  router.use(authenticateAdmin);

  router
    .route(API_ROUTES.BATCHES.LIST)
    .get(asyncHandler(batchController.getAll.bind(batchController)))
    .post(asyncHandler(batchController.create.bind(batchController)));

  router
    .route(API_ROUTES.BATCHES.DETAIL)
    .put(asyncHandler(batchController.update.bind(batchController)))
    .delete(asyncHandler(batchController.delete.bind(batchController)));

  return router;
};
