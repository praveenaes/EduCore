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
  subjectAssignmentQuerySchema,
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
    const query = subjectAssignmentQuerySchema.parse(req.query);
    const result = await this._getUseCase.execute(query);
    ResponseHelper.success(res, "Subject assignments retrieved successfully", result, HTTP_STATUS.OK);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this._getUseCase.getById(id);
    ResponseHelper.success(res, "Subject assignment retrieved successfully", result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createSubjectAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR);
    }
    const result = await this._createUseCase.execute(parsed.data);
    ResponseHelper.created(res, "Subject assigned successfully", result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateSubjectAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR);
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
