import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICreateAcademicYearUseCase } from '../../../application/ports/use-cases/academic-years/ICreateAcademicYearUseCase';
import { IGetAcademicYearsUseCase } from '../../../application/ports/use-cases/academic-years/IGetAcademicYearsUseCase';
import { IUpdateAcademicYearUseCase } from '../../../application/ports/use-cases/academic-years/IUpdateAcademicYearUseCase';
import { IDeleteAcademicYearUseCase } from '../../../application/ports/use-cases/academic-years/IDeleteAcademicYearUseCase';
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
  getAcademicYearsQuerySchema,
} from '../../validators/academicYearValidators';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';

@injectable()
export class AcademicYearController {
  constructor(
    @inject(TYPES.CreateAcademicYearUseCase)
    private _createAcademicYearUseCase: ICreateAcademicYearUseCase,
    @inject(TYPES.GetAcademicYearsUseCase)
    private _getAcademicYearsUseCase: IGetAcademicYearsUseCase,
    @inject(TYPES.UpdateAcademicYearUseCase)
    private _updateAcademicYearUseCase: IUpdateAcademicYearUseCase,
    @inject(TYPES.DeleteAcademicYearUseCase)
    private _deleteAcademicYearUseCase: IDeleteAcademicYearUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createAcademicYearSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ') || ERROR_MESSAGES.VALIDATION_ERROR;
      throw new ValidationError(errorMsg);
    }
    const result = await this._createAcademicYearUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Academic year created successfully.', result);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const parsed = getAcademicYearsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ') || ERROR_MESSAGES.VALIDATION_ERROR;
      throw new ValidationError(errorMsg);
    }
    const result = await this._getAcademicYearsUseCase.execute(parsed.data);
    ResponseHelper.success(res, 'Academic years retrieved successfully', result, HTTP_STATUS.OK);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = updateAcademicYearSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ') || ERROR_MESSAGES.VALIDATION_ERROR;
      throw new ValidationError(errorMsg);
    }
    const result = await this._updateAcademicYearUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Academic year updated successfully.', result, HTTP_STATUS.OK);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this._deleteAcademicYearUseCase.execute(id);
    ResponseHelper.success(res, 'Academic year deleted successfully.', null, HTTP_STATUS.OK);
  }
}
