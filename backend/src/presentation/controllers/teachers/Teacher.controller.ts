import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICreateTeacher } from '../../../application/ports/use-cases/teachers/ICreateTeacherUseCase';
import { IUpdateTeacher } from '../../../application/ports/use-cases/teachers/IUpdateTeacherUseCase';
import { IDeleteTeacher } from '../../../application/ports/use-cases/teachers/IDeleteTeacherUseCase';
import { GetTeachers } from '../../../application/use-cases/teachers/GetTeachers';
import { ToggleTeacherStatus } from '../../../application/use-cases/teachers/ToggleTeacherStatus';
import { ExportTeachersCsv } from '../../../application/use-cases/teachers/ExportTeachersCsv';
import { createTeacherSchema, updateTeacherSchema } from '../../http/validators/teacherValidators';
import { ValidationError } from '../../../application/error/AppError';
import { ERROR_MESSAGES } from '@/presentation/http/constants/messages';
import { ResponseHelper } from '../../http/response/ResponseHelper';

@injectable()
export class TeacherController {
  constructor(
    @inject(TYPES.GetTeachersUseCase) private _getTeachersUseCase: GetTeachers,
    @inject(TYPES.ToggleTeacherStatusUseCase) private _toggleTeacherStatusUseCase: ToggleTeacherStatus,
    @inject(TYPES.ExportTeachersCsvUseCase) private _exportTeachersCsvUseCase: ExportTeachersCsv,
    @inject(TYPES.CreateTeacherUseCase) private _createTeacherUseCase: ICreateTeacher,
    @inject(TYPES.UpdateTeacherUseCase) private _updateTeacherUseCase: IUpdateTeacher,
    @inject(TYPES.DeleteTeacherUseCase) private _deleteTeacherUseCase: IDeleteTeacher
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await this._getTeachersUseCase.execute({ page, limit, search });

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
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const resultDto = await this._createTeacherUseCase.execute(result.data, req.file);

    ResponseHelper.created(res, 'Teacher registered successfully.', resultDto);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate request body
    const result = updateTeacherSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const resultDto = await this._updateTeacherUseCase.execute(id, result.data, req.file);

    ResponseHelper.success(res, 'Teacher updated successfully.', resultDto, 200);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await this._deleteTeacherUseCase.execute(id);

    ResponseHelper.success(res, 'Teacher deleted successfully.', null, 200);
  };
}
