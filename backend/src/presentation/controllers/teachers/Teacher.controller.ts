import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICreateTeacher } from '../../../application/ports/use-cases/teachers/ICreateTeacherUseCase';
import { IUpdateTeacher } from '../../../application/ports/use-cases/teachers/IUpdateTeacherUseCase';
import { IDeleteTeacher } from '../../../application/ports/use-cases/teachers/IDeleteTeacherUseCase';
import { IGetTeachers } from '../../../application/ports/use-cases/teachers/IGetTeachersUseCase';
import { IToggleTeacherStatus } from '../../../application/ports/use-cases/teachers/IToggleTeacherStatusUseCase';
import { IExportTeachersCsv } from '../../../application/ports/use-cases/teachers/IExportTeachersCsvUseCase';
import { IGetTeacherCurriculum } from '../../../application/ports/use-cases/teachers/IGetTeacherCurriculumUseCase';
import { createTeacherSchema, updateTeacherSchema } from '../../validators/teacherValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { ResponseHelper } from '../../helpers/ResponseHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

@injectable()
export class TeacherController {
  constructor(
    @inject(TYPES.GetTeachersUseCase) private _getTeachersUseCase: IGetTeachers,
    @inject(TYPES.ToggleTeacherStatusUseCase) private _toggleTeacherStatusUseCase: IToggleTeacherStatus,
    @inject(TYPES.ExportTeachersCsvUseCase) private _exportTeachersCsvUseCase: IExportTeachersCsv,
    @inject(TYPES.CreateTeacherUseCase) private _createTeacherUseCase: ICreateTeacher,
    @inject(TYPES.UpdateTeacherUseCase) private _updateTeacherUseCase: IUpdateTeacher,
    @inject(TYPES.DeleteTeacherUseCase) private _deleteTeacherUseCase: IDeleteTeacher,
    @inject(TYPES.GetTeacherCurriculumUseCase) private _getCurriculumUseCase: IGetTeacherCurriculum
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getTeachersUseCase.execute(
      { search },
      { page, limit, sortBy, sortOrder }
    );

    ResponseHelper.success(res, "Teachers retrieved successfully", result, 200);
  };

  
  toggleStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await this._toggleTeacherStatusUseCase.execute({ id, isActive });

    ResponseHelper.success(res, 'Teacher status updated successfully', result, 200);
  };


  exportCsv = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string;

    const csv = await this._exportTeachersCsvUseCase.execute({ search });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="teachers.csv"');
    res.status(200).send(csv);
  };


  register = async (req: Request, res: Response): Promise<void> => {
    const result = createTeacherSchema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
      throw new ValidationError(result.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR, fieldErrors);
    }

    const resultDto = await this._createTeacherUseCase.execute(result.data, req.file);

    ResponseHelper.created(res, 'Teacher registered successfully.', resultDto);
  };


  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate request body
    const result = updateTeacherSchema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
      throw new ValidationError(result.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION_ERROR, fieldErrors);
    }

    const resultDto = await this._updateTeacherUseCase.execute(id, result.data, req.file);

    ResponseHelper.success(res, 'Teacher updated successfully.', resultDto, 200);
  };


  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await this._deleteTeacherUseCase.execute(id);

    ResponseHelper.success(res, 'Teacher deleted successfully.', null, 200);
  };

  getCurriculum = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this._getCurriculumUseCase.execute(userId);
    ResponseHelper.success(res, 'Teacher curriculum retrieved successfully', result, 200);
  };
}
