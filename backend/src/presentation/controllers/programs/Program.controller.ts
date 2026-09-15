import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';

import {
  createProgramSchema,
  updateProgramSchema,
} from '../../validators/programValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ICreateProgram } from '@/application/ports/use-cases/programs/ICreateProgramUseCase';
import { IGetPrograms } from '@/application/ports/use-cases/programs/IGetProgramsUseCase';
import { IUpdateProgram } from '@/application/ports/use-cases/programs/IUpdateProgramUseCase';
import { IDeleteProgram } from '@/application/ports/use-cases/programs/IDeleteProgramUseCase';

@injectable()
export class ProgramController {
  constructor(
    @inject(TYPES.CreateProgramUseCase) private _createProgramUseCase: ICreateProgram,
    @inject(TYPES.GetProgramsUseCase) private _getProgramsUseCase: IGetPrograms,
    @inject(TYPES.UpdateProgramUseCase) private _updateProgramUseCase: IUpdateProgram,
    @inject(TYPES.DeleteProgramUseCase) private _deleteProgramUseCase: IDeleteProgram
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getProgramsUseCase.execute(
      { search },
      { page, limit, sortBy, sortOrder }
    );

    ResponseHelper.success(res, "Programs retrieved successfully", result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createProgramUseCase.execute(parsed.data);
    ResponseHelper.created(res, "Program created successfully.", result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateProgramUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, "Program updated successfully.", result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteProgramUseCase.execute(id);
    ResponseHelper.success(res, "Program deleted successfully.", null, HTTP_STATUS.OK);
  };
}