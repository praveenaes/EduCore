import { Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IApplyLeaveUseCase } from '@/application/ports/use-cases/leave/IApplyLeaveUseCase';
import { IGetStudentLeavesUseCase } from '@/application/ports/use-cases/leave/IGetStudentLeavesUseCase';
import { IGetBatchLeavesUseCase } from '@/application/ports/use-cases/leave/IGetBatchLeavesUseCase';
import { IReviewLeaveUseCase } from '@/application/ports/use-cases/leave/IReviewLeaveUseCase';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { applyLeaveSchema, reviewLeaveSchema } from '../../validators/leaveValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';

@injectable()
export class LeaveController {
  constructor(
    @inject(TYPES.ApplyLeaveUseCase)
    private _applyLeaveUseCase: IApplyLeaveUseCase,
    @inject(TYPES.GetStudentLeavesUseCase)
    private _getStudentLeavesUseCase: IGetStudentLeavesUseCase,
    @inject(TYPES.GetBatchLeavesUseCase)
    private _getBatchLeavesUseCase: IGetBatchLeavesUseCase,
    @inject(TYPES.ReviewLeaveUseCase)
    private _reviewLeaveUseCase: IReviewLeaveUseCase
  ) {}


  applyLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const parsed = applyLeaveSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._applyLeaveUseCase.execute({
      userId,
      ...parsed.data,
    });

    ResponseHelper.created(res, 'Leave application submitted successfully', result);
  };


  getStudentLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this._getStudentLeavesUseCase.execute(userId);

    ResponseHelper.success(res, 'Student leaves retrieved successfully', result, 200);
  };


  getBatchLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const batchId = req.params.batchId as string;
    const status = req.query.status as string | undefined;

    const result = await this._getBatchLeavesUseCase.execute({
      userId,
      batchId,
      status,
    });

    ResponseHelper.success(res, 'Batch leave requests retrieved successfully', result, 200);
  };

  
  reviewLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const leaveId = req.params.id as string;
    const parsed = reviewLeaveSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._reviewLeaveUseCase.execute({
      userId,
      leaveId,
      ...parsed.data,
    });

    ResponseHelper.success(res, `Leave request ${parsed.data.status} successfully`, result, 200);
  };
}
