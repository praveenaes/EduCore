import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { createFeeAssignmentSchema, confirmFeePaymentSchema } from '../../validators/feeValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { UserRole } from '@/domain/enums/UserRole';
import { ICreateFeeAssignmentsUseCase } from '@/application/ports/use-cases/fees/ICreateFeeAssignmentsUseCase';
import { IGetFeeAssignmentsUseCase } from '@/application/ports/use-cases/fees/IGetFeeAssignmentsUseCase';
import { IInitFeePaymentUseCase } from '@/application/ports/use-cases/fees/IInitFeePaymentUseCase';
import { IConfirmFeePaymentUseCase } from '@/application/ports/use-cases/fees/IConfirmFeePaymentUseCase';
import { IGetPaymentLedgerUseCase } from '@/application/ports/use-cases/fees/IGetPaymentLedgerUseCase';
import { IProcessFeeWebhookUseCase } from '@/application/ports/use-cases/fees/IProcessFeeWebhookUseCase';
import { IRefundFeePaymentUseCase } from '@/application/ports/use-cases/fees/IRefundFeePaymentUseCase';
import { IRequestFeeRefundUseCase } from '@/application/ports/use-cases/fees/IRequestFeeRefundUseCase';
import { IRejectFeeRefundUseCase } from '@/application/ports/use-cases/fees/IRejectFeeRefundUseCase';

@injectable()
export class FeeController {
  constructor(
    @inject(TYPES.CreateFeeAssignmentsUseCase)
    private _createFeeAssignmentsUseCase: ICreateFeeAssignmentsUseCase,
    @inject(TYPES.GetFeeAssignmentsUseCase)
    private _getFeeAssignmentsUseCase: IGetFeeAssignmentsUseCase,
    @inject(TYPES.InitFeePaymentUseCase)
    private _initFeePaymentUseCase: IInitFeePaymentUseCase,
    @inject(TYPES.ConfirmFeePaymentUseCase)
    private _confirmFeePaymentUseCase: IConfirmFeePaymentUseCase,
    @inject(TYPES.GetPaymentLedgerUseCase)
    private _getPaymentLedgerUseCase: IGetPaymentLedgerUseCase,
    @inject(TYPES.ProcessFeeWebhookUseCase)
    private _processFeeWebhookUseCase: IProcessFeeWebhookUseCase,
    @inject(TYPES.RefundFeePaymentUseCase)
    private _refundFeePaymentUseCase: IRefundFeePaymentUseCase,
    @inject(TYPES.RequestFeeRefundUseCase)
    private _requestFeeRefundUseCase: IRequestFeeRefundUseCase,
    @inject(TYPES.RejectFeeRefundUseCase)
    private _rejectFeeRefundUseCase: IRejectFeeRefundUseCase
  ) {}

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    let studentId = req.query.studentId as string;
    let userId: string | undefined;

    if (req.user?.role?.toUpperCase() === UserRole.STUDENT) {
      userId = req.user.id;
    }

    const dueDateFrom = req.query.dueDateFrom
      ? new Date(req.query.dueDateFrom as string)
      : undefined;
    const dueDateTo = req.query.dueDateTo
      ? new Date(req.query.dueDateTo as string)
      : undefined;
    const amountMin = req.query.amountMin
      ? parseFloat(req.query.amountMin as string)
      : undefined;
    const amountMax = req.query.amountMax
      ? parseFloat(req.query.amountMax as string)
      : undefined;

    const result = await this._getFeeAssignmentsUseCase.execute(
      {
        studentId,
        userId,
        status,
        search,
        dueDateFrom,
        dueDateTo,
        amountMin,
        amountMax,
      },
      { page, limit, sortBy, sortOrder }
    );

    ResponseHelper.success(res, 'Fee assignments retrieved successfully.', result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createFeeAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createFeeAssignmentsUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Fee assignments created successfully.', result);
  };

  initPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const feeAssignmentId = req.params.id;
    const userId = req.user?.id || '';

    const result = await this._initFeePaymentUseCase.execute({
      feeAssignmentId,
      userId,
    });

    ResponseHelper.success(
      res,
      'Fee payment initialized successfully.',
      result,
      HTTP_STATUS.OK
    );
  };

  confirmPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const feeAssignmentId = req.params.id;
    const parsed = confirmFeePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._confirmFeePaymentUseCase.execute({
      feeAssignmentId,
      ...parsed.data,
    });

    ResponseHelper.success(
      res,
      'Fee payment confirmed successfully.',
      result,
      HTTP_STATUS.OK
    );
  };

  getLedger = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const paymentMethod = req.query.paymentMethod as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const result = await this._getPaymentLedgerUseCase.execute({
      page,
      limit,
      status,
      paymentMethod,
      search,
      startDate,
      endDate,
    });

    ResponseHelper.success(
      res,
      'Payment ledger retrieved successfully.',
      result,
      HTTP_STATUS.OK
    );
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const result = await this._processFeeWebhookUseCase.execute({
      rawBody,
      signature,
      payload: req.body,
    });

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.message,
      });
      return;
    }

    ResponseHelper.success(res, result.message, { status: 'ok' }, HTTP_STATUS.OK);
  };

  refundPayment = async (req: Request, res: Response): Promise<void> => {
    const paymentId = req.params.paymentId;
    const { reason, amount } = req.body;

    const result = await this._refundFeePaymentUseCase.execute({
      paymentId,
      reason,
      amount: amount ? Number(amount) : undefined,
    });

    ResponseHelper.success(
      res,
      'Fee payment refunded successfully.',
      result,
      HTTP_STATUS.OK
    );
  };

  requestRefund = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const feeAssignmentId = req.params.id;
    const userId = req.user?.id || '';
    const { reason } = req.body;

    const result = await this._requestFeeRefundUseCase.execute({
      feeAssignmentId,
      userId,
      reason,
    });

    ResponseHelper.success(res, result.message, result, HTTP_STATUS.OK);
  };

  rejectRefund = async (req: Request, res: Response): Promise<void> => {
    const paymentId = req.params.paymentId;
    const { remarks } = req.body;

    const result = await this._rejectFeeRefundUseCase.execute({
      paymentId,
      remarks,
    });

    ResponseHelper.success(res, result.message, result, HTTP_STATUS.OK);
  };
}
