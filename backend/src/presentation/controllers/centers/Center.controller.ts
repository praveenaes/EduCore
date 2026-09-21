import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICreateCenterUseCase } from '../../../application/ports/use-cases/centers/ICreateCenterUseCase';
import { IGetCentersUseCase } from '../../../application/ports/use-cases/centers/IGetCentersUseCase';
import { IUpdateCenterUseCase } from '../../../application/ports/use-cases/centers/IUpdateCenterUseCase';
import { IDeleteCenterUseCase } from '../../../application/ports/use-cases/centers/IDeleteCenterUseCase';
import {
  createCenterSchema,
  updateCenterSchema,
} from '../../validators/centerValidators';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';

@injectable()
export class CenterController {
  constructor(
    @inject(TYPES.CreateCenterUseCase)
    private _createCenterUseCase: ICreateCenterUseCase,
    @inject(TYPES.GetCentersUseCase)
    private _getCentersUseCase: IGetCentersUseCase,
    @inject(TYPES.UpdateCenterUseCase)
    private _updateCenterUseCase: IUpdateCenterUseCase,
    @inject(TYPES.DeleteCenterUseCase)
    private _deleteCenterUseCase: IDeleteCenterUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createCenterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._createCenterUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Center created successfully.', result);
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getCentersUseCase.execute(
      { search },
      { page, limit, sortBy, sortOrder }
    );
    ResponseHelper.success(res, 'Centers retrieved successfully', result, HTTP_STATUS.OK);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateCenterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._updateCenterUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Center updated successfully.', result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteCenterUseCase.execute(id);
    ResponseHelper.success(res, 'Center deleted successfully.', null, HTTP_STATUS.OK);
  };
}
