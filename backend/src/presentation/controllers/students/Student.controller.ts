import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { IGetStudents } from '../../../application/ports/use-cases/students/IGetStudentsUseCase';
import { IToggleStudentStatus } from '../../../application/ports/use-cases/students/IToggleStudentStatusUseCase';
import { IExportStudentsCsv } from '../../../application/ports/use-cases/students/IExportStudentsCsvUseCase';
import { ICreateStudent } from '../../../application/ports/use-cases/students/ICreateStudentUseCase';
import { IUpdateStudent } from '../../../application/ports/use-cases/students/IUpdateStudentUseCase';
import { IDeleteStudent } from '../../../application/ports/use-cases/students/IDeleteStudentUseCase';
import { createStudentSchema, updateStudentSchema } from '../../http/validators/studentValidators';
import { ValidationError } from '../../../application/error/AppError';
import { ERROR_MESSAGES } from '@/presentation/http/constants/messages';
import { HTTP_STATUS } from '@/presentation/http/constants/httpStatus';
import { ResponseHelper } from '../../http/response/ResponseHelper';

@injectable()
export class StudentController {
  constructor(
    @inject(TYPES.GetStudentsUseCase) private _getStudentsUseCase: IGetStudents,
    @inject(TYPES.ToggleStudentStatusUseCase) private _toggleStudentStatusUseCase: IToggleStudentStatus,
    @inject(TYPES.ExportStudentsCsvUseCase) private _exportStudentsCsvUseCase: IExportStudentsCsv,
    @inject(TYPES.CreateStudentUseCase) private _createStudentUseCase: ICreateStudent,
    @inject(TYPES.UpdateStudentUseCase) private _updateStudentUseCase: IUpdateStudent,
    @inject(TYPES.DeleteStudentUseCase) private _deleteStudentUseCase: IDeleteStudent
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 4;
    const search = req.query.search as string;

    const result = await this._getStudentsUseCase.execute({ page, limit, search });

    ResponseHelper.success(res, "Students retrieved successfully", result, 200);
  };

toggleStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await this._toggleStudentStatusUseCase.execute({ id, isActive });

    ResponseHelper.success(res, 'Student status updated successfully', result);
  };

  exportCsv = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string;

    const csv = await this._exportStudentsCsvUseCase.execute({ search });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.status(200).send(csv);
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const result = createStudentSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const resultDto = await this._createStudentUseCase.execute(result.data, req.file);

    ResponseHelper.created(res, 'Student registered successfully.', resultDto);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = updateStudentSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const resultDto = await this._updateStudentUseCase.execute(id, result.data, req.file);

    ResponseHelper.success(res, 'Student updated successfully.', resultDto, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteStudentUseCase.execute(id);
    ResponseHelper.success(res, 'Student deleted successfully.', null);
  };
}
