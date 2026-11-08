import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '@/config/di/types';
import { FeeController } from '@/presentation/controllers/fees/Fee.controller';
import { authenticateAdmin, authenticateUser } from '../middleware/authMiddleware';
import { asyncHandler } from '@/presentation/helpers/asyncHandler';
import { API_ROUTES } from '@/config/routes.config';

export const getFeeRoutes = (container: Container): Router => {
  const router = Router();
  const feeController = container.get<FeeController>(TYPES.FeeController);

  router
    .route(API_ROUTES.FEES.LIST)
    .get(authenticateUser, asyncHandler(feeController.getAll.bind(feeController)))
    .post(authenticateAdmin, asyncHandler(feeController.create.bind(feeController)));

  router
    .route(API_ROUTES.FEES.TRANSACTIONS)
    .get(authenticateAdmin, asyncHandler(feeController.getLedger.bind(feeController)));

  router
    .route(API_ROUTES.FEES.WEBHOOK)
    .post(asyncHandler(feeController.handleWebhook.bind(feeController)));

  router
    .route(API_ROUTES.FEES.REFUND_PAYMENT)
    .post(authenticateAdmin, asyncHandler(feeController.refundPayment.bind(feeController)));

  router
    .route(API_ROUTES.FEES.REJECT_REFUND)
    .post(authenticateAdmin, asyncHandler(feeController.rejectRefund.bind(feeController)));

  router
    .route(API_ROUTES.FEES.REQUEST_REFUND)
    .post(authenticateUser, asyncHandler(feeController.requestRefund.bind(feeController)));

  router
    .route(API_ROUTES.FEES.INIT_PAYMENT)
    .post(authenticateUser, asyncHandler(feeController.initPayment.bind(feeController)));

  router
    .route(API_ROUTES.FEES.CONFIRM_PAYMENT)
    .post(authenticateUser, asyncHandler(feeController.confirmPayment.bind(feeController)));

  return router;
};
