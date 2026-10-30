import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  createAssessmentScheduleSchema,
  updateAssessmentScheduleSchema,
} from '../../validators/assessmentScheduleValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ICreateAssessmentScheduleUseCase } from '@/application/ports/use-cases/assessment-schedules/ICreateAssessmentScheduleUseCase';
import { IGetAssessmentSchedulesUseCase } from '@/application/ports/use-cases/assessment-schedules/IGetAssessmentSchedulesUseCase';
import { IUpdateAssessmentScheduleUseCase } from '@/application/ports/use-cases/assessment-schedules/IUpdateAssessmentScheduleUseCase';
import { IToggleAssessmentScheduleStatusUseCase } from '@/application/ports/use-cases/assessment-schedules/IToggleAssessmentScheduleStatusUseCase';
import { IDeleteAssessmentScheduleUseCase } from '@/application/ports/use-cases/assessment-schedules/IDeleteAssessmentScheduleUseCase';

@injectable()
export class AssessmentScheduleController {
  constructor(
    @inject(TYPES.CreateAssessmentScheduleUseCase)
    private _createUseCase: ICreateAssessmentScheduleUseCase,
    @inject(TYPES.GetAssessmentSchedulesUseCase)
    private _getUseCase: IGetAssessmentSchedulesUseCase,
    @inject(TYPES.UpdateAssessmentScheduleUseCase)
    private _updateUseCase: IUpdateAssessmentScheduleUseCase,
    @inject(TYPES.ToggleAssessmentScheduleStatusUseCase)
    private _toggleStatusUseCase: IToggleAssessmentScheduleStatusUseCase,
    @inject(TYPES.DeleteAssessmentScheduleUseCase)
    private _deleteUseCase: IDeleteAssessmentScheduleUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const { search, assessmentId, courseId, criteriaId, batchId, centerId, sortBy } =
      req.query as Record<string, string | undefined>;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const levelNumber =
      req.query.levelNumber !== undefined
        ? parseInt(req.query.levelNumber as string)
        : undefined;
    const isCompleted =
      req.query.isCompleted !== undefined
        ? req.query.isCompleted === 'true'
        : undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    const result = await this._getUseCase.execute({
      page,
      limit,
      search: search?.trim(),
      assessmentId,
      courseId,
      levelNumber,
      criteriaId,
      batchId,
      centerId,
      isCompleted,
      sortBy,
      sortOrder,
    });

    ResponseHelper.success(res, 'Assessment schedules retrieved successfully', result, HTTP_STATUS.OK);
  };


  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createAssessmentScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError( ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createUseCase.execute(parsed.data);
    ResponseHelper.created(res, 'Assessment schedule created successfully.', result);
  };


  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateAssessmentScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, 'Assessment schedule updated successfully.', result, HTTP_STATUS.OK);
  };


  toggleStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this._toggleStatusUseCase.execute(id);
    ResponseHelper.success(res, 'Assessment schedule status updated successfully.', result, HTTP_STATUS.OK);
  };

  
  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteUseCase.execute(id);
    ResponseHelper.success(res, 'Assessment schedule deleted successfully.', null, HTTP_STATUS.OK);
  };
}
