import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IDeleteHomeworkUseCase } from '@/application/ports/use-cases/homework/IDeleteHomeworkUseCase';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class DeleteHomework implements IDeleteHomeworkUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(homeworkId: string, userId: string): Promise<void> {
    const teacher = await this._teacherRepo.findByUserId(userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const homework = await this._homeworkRepo.findById(homeworkId);
    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    if (homework.assignedBy !== teacher.id) {
      throw new ForbiddenError('You are not authorized to delete this homework.');
    }

    if (homework.verifiedCount > 0) {
      throw new BadRequestError('Cannot delete homework. Some student submissions have already been verified.');
    }

    await this._homeworkRepo.softDelete(homeworkId);
  }
}
