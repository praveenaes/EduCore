import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  createAssessmentCriteriaSchema,
  updateAssessmentCriteriaSchema,
} from '../../validators/assessmentCriteriaValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ICreateAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/ICreateAssessmentCriteriaUseCase';
import { IGetAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IGetAssessmentCriteriaUseCase';
import { IUpdateAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IUpdateAssessmentCriteriaUseCase';
import { IDeleteAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IDeleteAssessmentCriteriaUseCase';

@injectable()
export class AssessmentCriteriaController {
  constructor(
    @inject(TYPES.CreateAssessmentCriteriaUseCase)
    private _createUseCase: ICreateAssessmentCriteriaUseCase,
    @inject(TYPES.GetAssessmentCriteriaUseCase)
    private _getUseCase: IGetAssessmentCriteriaUseCase,
    @inject(TYPES.UpdateAssessmentCriteriaUseCase)
    private _updateUseCase: IUpdateAssessmentCriteriaUseCase,
    @inject(TYPES.DeleteAssessmentCriteriaUseCase)
    private _deleteUseCase: IDeleteAssessmentCriteriaUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const { search, courseId, sortBy } =
      req.query as Record<string, string | undefined>;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const levelNumber =
      req.query.levelNumber !== undefined
        ? parseInt(req.query.levelNumber as string)
        : undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    const result = await this._getUseCase.execute(
      {
        search: search?.trim(),
        courseId,
        levelNumber,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    ResponseHelper.success(res, 'Assessment criteria retrieved successfully', result, HTTP_STATUS.OK);
  };

  
  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createAssessmentCriteriaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Assessment criteria created successfully.', result);
  };

  
  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateAssessmentCriteriaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError( ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Assessment criteria updated successfully.', result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteUseCase.execute(id);
    ResponseHelper.success(res, 'Assessment criteria deleted successfully.', null, HTTP_STATUS.OK);
  };
}
