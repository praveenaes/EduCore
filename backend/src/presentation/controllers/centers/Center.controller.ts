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
  getCentersQuerySchema,
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

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCenterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._createCenterUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Center created successfully.', result);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const parsed = getCentersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._getCentersUseCase.execute(parsed.data);
    ResponseHelper.success(res, 'Centers retrieved successfully', result, HTTP_STATUS.OK);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = updateCenterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._updateCenterUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Center updated successfully.', result, HTTP_STATUS.OK);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this._deleteCenterUseCase.execute(id);
    ResponseHelper.success(res, 'Center deleted successfully.', null, HTTP_STATUS.OK);
  }
}
