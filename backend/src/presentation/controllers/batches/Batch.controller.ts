import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  createBatchSchema,
  updateBatchSchema,
} from '../../validators/batchValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ICreateBatchUseCase } from '@/application/ports/use-cases/batches/ICreateBatchUseCase';
import { IGetBatchesUseCase } from '@/application/ports/use-cases/batches/IGetBatchesUseCase';
import { IUpdateBatchUseCase } from '@/application/ports/use-cases/batches/IUpdateBatchUseCase';
import { IDeleteBatchUseCase } from '@/application/ports/use-cases/batches/IDeleteBatchUseCase';

@injectable()
export class BatchController {
  constructor(
    @inject(TYPES.CreateBatchUseCase) private _createBatchUseCase: ICreateBatchUseCase,
    @inject(TYPES.GetBatchesUseCase) private _getBatchesUseCase: IGetBatchesUseCase,
    @inject(TYPES.UpdateBatchUseCase) private _updateBatchUseCase: IUpdateBatchUseCase,
    @inject(TYPES.DeleteBatchUseCase) private _deleteBatchUseCase: IDeleteBatchUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const { search, courseId, centerId, academicYearId, sortBy } =
      req.query as Record<string, string | undefined>;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const levelNumber =
      req.query.levelNumber !== undefined
        ? parseInt(req.query.levelNumber as string)
        : undefined;
    const isActive =
      req.query.isActive === 'true'
        ? true
        : req.query.isActive === 'false'
        ? false
        : undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getBatchesUseCase.execute(
      {
        search,
        courseId,
        levelNumber,
        centerId,
        academicYearId,
        isActive,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    ResponseHelper.success(res, 'Batches retrieved successfully', result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createBatchUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Batch created successfully.', result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateBatchUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Batch updated successfully.', result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteBatchUseCase.execute(id);
    ResponseHelper.success(res, 'Batch deleted successfully.', null, HTTP_STATUS.OK);
  };
}
