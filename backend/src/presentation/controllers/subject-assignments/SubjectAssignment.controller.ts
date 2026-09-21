import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICreateSubjectAssignmentUseCase } from '../../../application/ports/use-cases/subject-assignments/ICreateSubjectAssignmentUseCase';
import { IGetSubjectAssignmentsUseCase } from '../../../application/ports/use-cases/subject-assignments/IGetSubjectAssignmentsUseCase';
import { IUpdateSubjectAssignmentUseCase } from '../../../application/ports/use-cases/subject-assignments/IUpdateSubjectAssignmentUseCase';
import { IDeleteSubjectAssignmentUseCase } from '../../../application/ports/use-cases/subject-assignments/IDeleteSubjectAssignmentUseCase';
import {
  createSubjectAssignmentSchema,
  updateSubjectAssignmentSchema,
} from '../../validators/subjectAssignmentValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';

@injectable()
export class SubjectAssignmentController {
  constructor(
    @inject(TYPES.CreateSubjectAssignmentUseCase)
    private _createUseCase: ICreateSubjectAssignmentUseCase,
    @inject(TYPES.GetSubjectAssignmentsUseCase)
    private _getUseCase: IGetSubjectAssignmentsUseCase,
    @inject(TYPES.UpdateSubjectAssignmentUseCase)
    private _updateUseCase: IUpdateSubjectAssignmentUseCase,
    @inject(TYPES.DeleteSubjectAssignmentUseCase)
    private _deleteUseCase: IDeleteSubjectAssignmentUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const { search, courseId, subjectId, teacherId, sortBy } =
      req.query as Record<string, string | undefined>;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const levelNumber =
      req.query.levelNumber !== undefined
        ? parseInt(req.query.levelNumber as string)
        : undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getUseCase.execute({
      page,
      limit,
      search,
      courseId,
      levelNumber,
      subjectId,
      teacherId,
      sortBy,
      sortOrder,
    });

    ResponseHelper.success(res, "Subject assignments retrieved successfully", result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createSubjectAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError( ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._createUseCase.execute(parsed.data);
    ResponseHelper.created(res, "Subject assigned successfully", result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateSubjectAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError( ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._updateUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, "Subject assignment updated successfully", result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteUseCase.execute(id);
    ResponseHelper.success(res, "Subject assignment removed successfully", null, HTTP_STATUS.OK);
  };
}
