import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentQuerySchema,
} from '../../validators/assessmentValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ICreateAssessmentUseCase } from '@/application/ports/use-cases/assessments/ICreateAssessmentUseCase';
import { IGetAssessmentsUseCase } from '@/application/ports/use-cases/assessments/IGetAssessmentsUseCase';
import { IUpdateAssessmentUseCase } from '@/application/ports/use-cases/assessments/IUpdateAssessmentUseCase';
import { IDeleteAssessmentUseCase } from '@/application/ports/use-cases/assessments/IDeleteAssessmentUseCase';
import { AssessmentStatus } from '@/domain/entities/Assessment';

@injectable()
export class AssessmentController {
  constructor(
    @inject(TYPES.CreateAssessmentUseCase)
    private _createAssessmentUseCase: ICreateAssessmentUseCase,
    @inject(TYPES.GetAssessmentsUseCase)
    private _getAssessmentsUseCase: IGetAssessmentsUseCase,
    @inject(TYPES.UpdateAssessmentUseCase)
    private _updateAssessmentUseCase: IUpdateAssessmentUseCase,
    @inject(TYPES.DeleteAssessmentUseCase)
    private _deleteAssessmentUseCase: IDeleteAssessmentUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const parsed = assessmentQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      throw new ValidationError(msg);
    }

    const { page, limit, search, academicYearId, status, sortBy, sortOrder } = parsed.data;

    const result = await this._getAssessmentsUseCase.execute(
      {
        search,
        academicYearId,
        status: status as AssessmentStatus | undefined,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    ResponseHelper.success(res, 'Assessments retrieved successfully', result, HTTP_STATUS.OK);
  };


  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createAssessmentUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Assessment created successfully.', result);
  };


  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join(', ') || ERROR_MESSAGES.VALIDATION_ERROR;
      throw new ValidationError(msg);
    }

    const result = await this._updateAssessmentUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Assessment updated successfully.', result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteAssessmentUseCase.execute(id);
    ResponseHelper.success(res, 'Assessment deleted successfully.', null, HTTP_STATUS.OK);
  };
}
