import { Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IGetBatchAttendanceUseCase } from '@/application/ports/use-cases/attendance/IGetBatchAttendanceUseCase';
import { ICreateBatchAttendanceUseCase } from '@/application/ports/use-cases/attendance/ICreateBatchAttendanceUseCase';
import { IUpdateBatchAttendanceUseCase } from '@/application/ports/use-cases/attendance/IUpdateBatchAttendanceUseCase';
import { IGetStudentAttendanceUseCase } from '@/application/ports/use-cases/attendance/IGetStudentAttendanceUseCase';
import {
  createBatchAttendanceSchema,
  updateBatchAttendanceSchema,
} from '../../validators/attendanceValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

@injectable()
export class AttendanceController {
  constructor(
    @inject(TYPES.GetBatchAttendanceUseCase)
    private _getBatchAttendanceUseCase: IGetBatchAttendanceUseCase,
    @inject(TYPES.CreateBatchAttendanceUseCase)
    private _createBatchAttendanceUseCase: ICreateBatchAttendanceUseCase,
    @inject(TYPES.UpdateBatchAttendanceUseCase)
    private _updateBatchAttendanceUseCase: IUpdateBatchAttendanceUseCase,
    @inject(TYPES.GetStudentAttendanceUseCase)
    private _getStudentAttendanceUseCase: IGetStudentAttendanceUseCase
  ) {}

  //for teacher
  getBatchAttendance = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const batchId = req.query.batchId as string;
    const date = req.query.date as string;

    const result = await this._getBatchAttendanceUseCase.execute({
      batchId,
      date,
      userId,
    });

    ResponseHelper.success(res, 'Batch attendance retrieved successfully', result, 200);
  };

  createBatchAttendance = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const parsed = createBatchAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createBatchAttendanceUseCase.execute({
      ...parsed.data,
      userId,
    });

    ResponseHelper.created(res, 'Batch attendance created successfully', result);
  };

  updateBatchAttendance = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const parsed = updateBatchAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateBatchAttendanceUseCase.execute({
      ...parsed.data,
      userId,
    });

    ResponseHelper.success(res, 'Batch attendance updated successfully', result, 200);
  };

  getStudentAttendance = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    const result = await this._getStudentAttendanceUseCase.execute({
      userId,
      month,
      year,
    });

    ResponseHelper.success(res, 'Student attendance retrieved successfully', result, 200);
  };
}
