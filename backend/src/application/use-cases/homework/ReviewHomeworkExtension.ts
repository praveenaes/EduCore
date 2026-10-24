import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IReviewHomeworkExtensionUseCase } from '@/application/ports/use-cases/homework/IReviewHomeworkExtensionUseCase';
import { ReviewHomeworkExtensionDTO } from '@/application/dto/homework/homeworkDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class ReviewHomeworkExtension implements IReviewHomeworkExtensionUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(dto: ReviewHomeworkExtensionDTO): Promise<void> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const homework = await this._homeworkRepo.findById(dto.homeworkId);
    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    if (homework.assignedBy !== teacher.id) {
      throw new ForbiddenError('You are not authorized to review requests for this homework.');
    }

    const submission = homework.submissions.find((s) => s.studentId === dto.studentId);
    if (!submission || !submission.extensionRequest) {
      throw new NotFoundError('No extension request found for this student.');
    }

    let parsedExtendedDueDate: Date | null = null;
    if (dto.status === 'approved') {
      if (dto.extendedDueDate) {
        parsedExtendedDueDate = new Date(dto.extendedDueDate);
        if (isNaN(parsedExtendedDueDate.getTime())) {
          throw new BadRequestError('Invalid extended due date format.');
        }
        if (parsedExtendedDueDate <= new Date()) {
          throw new BadRequestError('Extended due date must be in the future.');
        }
      } else {
        // Default to 24 hours from now if teacher didn't select a custom date
        const defaultDue = new Date();
        defaultDue.setHours(defaultDue.getHours() + 24);
        parsedExtendedDueDate = defaultDue;
      }
    }

    homework.reviewExtension(
      dto.studentId,
      dto.status,
      parsedExtendedDueDate,
      dto.teacherRemarks,
      teacher.id
    );

    await this._homeworkRepo.update(homework.id!, homework);
  }
}
