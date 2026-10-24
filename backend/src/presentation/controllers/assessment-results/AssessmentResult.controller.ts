import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  saveAssessmentMarksSchema,
  assessmentResultQuerySchema,
  publishResultsSchema,
} from '../../validators/assessmentResultValidators';
import { ValidationError, UnauthorizedError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { ISaveAssessmentMarksUseCase } from '@/application/ports/use-cases/assessment-results/ISaveAssessmentMarksUseCase';
import { IGetAssessmentResultsUseCase } from '@/application/ports/use-cases/assessment-results/IGetAssessmentResultsUseCase';
import { IGetMarkEntrySheetUseCase } from '@/application/ports/use-cases/assessment-results/IGetMarkEntrySheetUseCase';
import { IPublishAssessmentResultsUseCase } from '@/application/ports/use-cases/assessment-results/IPublishAssessmentResultsUseCase';
import { IGetStudentResultsUseCase } from '@/application/ports/use-cases/assessment-results/IGetStudentResultsUseCase';
import { IGetStudentReportCardUseCase } from '@/application/ports/use-cases/assessment-results/IGetStudentReportCardUseCase';

@injectable()
export class AssessmentResultController {
  constructor(
    @inject(TYPES.SaveAssessmentMarksUseCase)
    private _saveMarksUseCase: ISaveAssessmentMarksUseCase,
    @inject(TYPES.GetAssessmentResultsUseCase)
    private _getResultsUseCase: IGetAssessmentResultsUseCase,
    @inject(TYPES.GetMarkEntrySheetUseCase)
    private _getEntrySheetUseCase: IGetMarkEntrySheetUseCase,
    @inject(TYPES.PublishAssessmentResultsUseCase)
    private _publishUseCase: IPublishAssessmentResultsUseCase,
    @inject(TYPES.GetStudentResultsUseCase)
    private _getStudentResultsUseCase: IGetStudentResultsUseCase,
    @inject(TYPES.GetStudentReportCardUseCase)
    private _getReportCardUseCase: IGetStudentReportCardUseCase
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const parsed = assessmentResultQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._getResultsUseCase.execute(parsed.data);
    ResponseHelper.success(res, 'Assessment results retrieved successfully', result, HTTP_STATUS.OK);
  };

  getMarkEntrySheet = async (req: Request, res: Response): Promise<void> => {
    const { scheduleId } = req.params;
    if (!scheduleId) {
      throw new ValidationError('Schedule ID is required');
    }

    const result = await this._getEntrySheetUseCase.execute(scheduleId);
    ResponseHelper.success(res, 'Mark entry sheet loaded successfully', result, HTTP_STATUS.OK);
  };

  saveMarks = async (req: Request, res: Response): Promise<void> => {
    const parsed = saveAssessmentMarksSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._saveMarksUseCase.execute(parsed.data);
    ResponseHelper.success(res, 'Assessment marks saved successfully.', result, HTTP_STATUS.OK);
  };

  publishResults = async (req: Request, res: Response): Promise<void> => {
    const parsed = publishResultsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._publishUseCase.execute(parsed.data);
    ResponseHelper.success(res, 'Assessment results publishing status updated.', result, HTTP_STATUS.OK);
  };

  getMyResults = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const result = await this._getStudentResultsUseCase.execute(userId);
    ResponseHelper.success(res, 'My assessment results retrieved successfully', result, HTTP_STATUS.OK);
  };

  getMyReportCard = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { assessmentId } = req.params;
    const result = await this._getReportCardUseCase.execute({ userId, assessmentId });
    ResponseHelper.success(res, 'Report card retrieved successfully', result, HTTP_STATUS.OK);
  };

  getStudentReportCard = async (req: Request, res: Response): Promise<void> => {
    const { assessmentId, studentId } = req.params;
    const result = await this._getReportCardUseCase.execute({ studentId, assessmentId });
    ResponseHelper.success(res, 'Student report card retrieved successfully', result, HTTP_STATUS.OK);
  };
}
