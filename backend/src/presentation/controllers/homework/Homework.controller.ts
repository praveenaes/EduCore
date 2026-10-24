import { Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ICreateHomeworkUseCase } from '@/application/ports/use-cases/homework/ICreateHomeworkUseCase';
import { IUpdateHomeworkUseCase } from '@/application/ports/use-cases/homework/IUpdateHomeworkUseCase';
import { IGetTeacherHomeworksUseCase } from '@/application/ports/use-cases/homework/IGetTeacherHomeworksUseCase';
import { IGetHomeworkSubmissionsUseCase } from '@/application/ports/use-cases/homework/IGetHomeworkSubmissionsUseCase';
import { IReviewHomeworkSubmissionUseCase } from '@/application/ports/use-cases/homework/IReviewHomeworkSubmissionUseCase';
import { IDeleteHomeworkUseCase } from '@/application/ports/use-cases/homework/IDeleteHomeworkUseCase';
import { IGetStudentHomeworksUseCase } from '@/application/ports/use-cases/homework/IGetStudentHomeworksUseCase';
import { ISubmitHomeworkUseCase } from '@/application/ports/use-cases/homework/ISubmitHomeworkUseCase';
import { IRequestHomeworkExtensionUseCase } from '@/application/ports/use-cases/homework/IRequestHomeworkExtensionUseCase';
import { IReviewHomeworkExtensionUseCase } from '@/application/ports/use-cases/homework/IReviewHomeworkExtensionUseCase';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { createHomeworkSchema, updateHomeworkSchema } from '../../validators/homeworkValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';

@injectable()
export class HomeworkController {
  constructor(
    @inject(TYPES.CreateHomeworkUseCase)
    private _createHomeworkUseCase: ICreateHomeworkUseCase,
    @inject(TYPES.UpdateHomeworkUseCase)
    private _updateHomeworkUseCase: IUpdateHomeworkUseCase,
    @inject(TYPES.GetTeacherHomeworksUseCase)
    private _getTeacherHomeworksUseCase: IGetTeacherHomeworksUseCase,
    @inject(TYPES.GetHomeworkSubmissionsUseCase)
    private _getHomeworkSubmissionsUseCase: IGetHomeworkSubmissionsUseCase,
    @inject(TYPES.ReviewHomeworkSubmissionUseCase)
    private _reviewHomeworkSubmissionUseCase: IReviewHomeworkSubmissionUseCase,
    @inject(TYPES.DeleteHomeworkUseCase)
    private _deleteHomeworkUseCase: IDeleteHomeworkUseCase,
    @inject(TYPES.GetStudentHomeworksUseCase)
    private _getStudentHomeworksUseCase: IGetStudentHomeworksUseCase,
    @inject(TYPES.SubmitHomeworkUseCase)
    private _submitHomeworkUseCase: ISubmitHomeworkUseCase,
    @inject(TYPES.RequestHomeworkExtensionUseCase)
    private _requestHomeworkExtensionUseCase: IRequestHomeworkExtensionUseCase,
    @inject(TYPES.ReviewHomeworkExtensionUseCase)
    private _reviewHomeworkExtensionUseCase: IReviewHomeworkExtensionUseCase
  ) {}

  // ==============================
  // Teacher Endpoints
  // ==============================

  createHomework = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const parsed = createHomeworkSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createHomeworkUseCase.execute({
      ...parsed.data,
      userId,
    });
    ResponseHelper.created(res, 'Homework created successfully', result);
  };

  updateHomework = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const homeworkId = req.params.id;
    const parsed = updateHomeworkSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateHomeworkUseCase.execute({
      ...parsed.data,
      homeworkId,
      userId,
    });
    ResponseHelper.success(res, 'Homework updated successfully', result, 200);
  };

  getTeacherHomeworks = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const search = req.query.search as string | undefined;
    const batchId = req.query.batchId as string | undefined;

    const result = await this._getTeacherHomeworksUseCase.execute({
      userId,
      page,
      limit,
      search,
      batchId,
    });

    ResponseHelper.success(res, 'Homework assignments retrieved successfully', result, 200);
  };

  getHomeworkSubmissions = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const homeworkId = req.params.id;

    const result = await this._getHomeworkSubmissionsUseCase.execute(
      homeworkId,
      userId
    );

    ResponseHelper.success(res, 'Submissions retrieved successfully', result, 200);
  };

  reviewSubmission = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const homeworkId = req.params.id;
    const { participantId, status, remarks } = req.body;

    await this._reviewHomeworkSubmissionUseCase.execute({
      homeworkId,
      participantId,
      status,
      remarks,
      userId,
    });

    ResponseHelper.success(res, 'Submission reviewed successfully', null, 200);
  };

  deleteHomework = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const homeworkId = req.params.id;

    await this._deleteHomeworkUseCase.execute(homeworkId, userId);

    ResponseHelper.success(res, 'Homework deleted successfully', null, 200);
  };

  // ==============================
  // Student Endpoints
  // ==============================

  getStudentHomeworks = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const status = req.query.status as string | undefined;

    const result = await this._getStudentHomeworksUseCase.execute({
      userId,
      page,
      limit,
      status,
    });

    ResponseHelper.success(res, 'Student homeworks retrieved successfully', result, 200);
  };

  submitHomework = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const participantId = req.params.id;
    const { attachments } = req.body;

    await this._submitHomeworkUseCase.execute({
      participantId,
      userId,
      attachments: attachments || [],
    });

    ResponseHelper.success(res, 'Homework submitted successfully', null, 200);
  };

  requestExtension = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const homeworkId = req.params.id;
    const { reason, explanation, attachment } = req.body;

    await this._requestHomeworkExtensionUseCase.execute({
      homeworkId,
      userId,
      reason,
      explanation,
      attachment,
    });

    ResponseHelper.success(res, 'Extension requested successfully', null, 200);
  };

  reviewExtension = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const homeworkId = req.params.homeworkId;
    const studentId = req.params.studentId;
    const { status, extendedDueDate, teacherRemarks } = req.body;

    await this._reviewHomeworkExtensionUseCase.execute({
      homeworkId,
      studentId,
      userId,
      status,
      extendedDueDate,
      teacherRemarks,
    });

    ResponseHelper.success(res, 'Extension request reviewed successfully', null, 200);
  };
}
