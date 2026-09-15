import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICreateCourse } from '../../../application/ports/use-cases/courses/ICreateCourseUseCase';
import { IGetCourses } from '../../../application/ports/use-cases/courses/IGetCoursesUseCase';
import { IUpdateCourse } from '../../../application/ports/use-cases/courses/IUpdateCourseUseCase';
import { IDeleteCourse } from '../../../application/ports/use-cases/courses/IDeleteCourseUseCase';
import {
  createCourseSchema,
  updateCourseSchema,
} from '../../validators/courseValidators';
import { ValidationError } from '@/shared/errors/AppError';
import { ERROR_MESSAGES } from '@/presentation/constants/messages';
import { HTTP_STATUS } from '@/presentation/constants/httpStatus';
import { ResponseHelper } from '../../helpers/ResponseHelper';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CreateCourseUseCase) private _createCourseUseCase: ICreateCourse,
    @inject(TYPES.GetCoursesUseCase) private _getCoursesUseCase: IGetCourses,
    @inject(TYPES.UpdateCourseUseCase) private _updateCourseUseCase: IUpdateCourse,
    @inject(TYPES.DeleteCourseUseCase) private _deleteCourseUseCase: IDeleteCourse
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const programId = req.query.programId as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc';

    const result = await this._getCoursesUseCase.execute(
      { search, programId },
      { page, limit, sortBy, sortOrder }
    );

    ResponseHelper.success(res, "Courses retrieved successfully", result, HTTP_STATUS.OK);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._createCourseUseCase.execute(parsed.data);
    ResponseHelper.created(res, "Course created successfully.", result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = updateCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const result = await this._updateCourseUseCase.execute(id, parsed.data);
    ResponseHelper.success(res, "Course updated successfully.", result, HTTP_STATUS.OK);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteCourseUseCase.execute(id);
    ResponseHelper.success(res, "Course deleted successfully.", null, HTTP_STATUS.OK);
  };
}
