import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';

import {
  createSubjectSchema,
  updateSubjectSchema,
} from '../../validators/subjectValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ICreateSubject } from '@/application/ports/use-cases/subjects/ICreateSubjectUseCase';
import { IGetSubjects } from '@/application/ports/use-cases/subjects/IGetSubjectsUseCase';
import { IUpdateSubject } from '@/application/ports/use-cases/subjects/IUpdateSubjectUseCase';
import { IDeleteSubject } from '@/application/ports/use-cases/subjects/IDeleteSubjectUseCase';

@injectable()
export class SubjectController {
  constructor(
    @inject(TYPES.CreateSubjectUseCase) private _createSubjectUseCase: ICreateSubject,
    @inject(TYPES.GetSubjectsUseCase) private _getSubjectsUseCase: IGetSubjects,
    @inject(TYPES.UpdateSubjectUseCase) private _updateSubjectUseCase: IUpdateSubject,
    @inject(TYPES.DeleteSubjectUseCase) private _deleteSubjectUseCase: IDeleteSubject
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getSubjectsUseCase.execute(
      { search },
      { page, limit, sortBy, sortOrder }
    );

    ResponseHelper.success(res, "Subjects retrieved successfully", result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createSubjectUseCase.execute(parsed.data);
    ResponseHelper.created(res, "Subject created successfully.", result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateSubjectUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, "Subject updated successfully.", result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteSubjectUseCase.execute(id);
    ResponseHelper.success(res, "Subject deleted successfully.", null, HTTP_STATUS.OK);
  };
}
