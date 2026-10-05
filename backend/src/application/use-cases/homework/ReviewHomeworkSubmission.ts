import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IReviewHomeworkSubmissionUseCase } from '@/application/ports/use-cases/homework/IReviewHomeworkSubmissionUseCase';
import { ReviewSubmissionDTO } from '@/application/dto/homework/homeworkDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class ReviewHomeworkSubmission implements IReviewHomeworkSubmissionUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(dto: ReviewSubmissionDTO): Promise<void> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const homework = await this._homeworkRepo.findById(dto.homeworkId);
    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    if (homework.assignedBy !== teacher.id) {
      throw new ForbiddenError('You are not authorized to review submissions for this homework.');
    }

    // participantId can be either the studentId or sub._id
    const targetSubmission = homework.submissions.find(
      (s) => s.id === dto.participantId || s.studentId === dto.participantId
    );

    if (!targetSubmission) {
      throw new NotFoundError('Student submission record not found.');
    }

    if (targetSubmission.status === 'pending') {
      throw new BadRequestError('Cannot review a pending submission that has not been submitted yet.');
    }

    await this._homeworkRepo.updateSubmission(homework.id!, targetSubmission.studentId, {
      status: dto.status,
      remarks: dto.remarks?.trim() || '',
      verifiedAt: new Date(),
    });
  }
}
