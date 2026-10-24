import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IRequestHomeworkExtensionUseCase } from '@/application/ports/use-cases/homework/IRequestHomeworkExtensionUseCase';
import { RequestHomeworkExtensionDTO } from '@/application/dto/homework/homeworkDtos';
import { NotFoundError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class RequestHomeworkExtension implements IRequestHomeworkExtensionUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(dto: RequestHomeworkExtensionDTO): Promise<void> {
    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }

    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestError('Reason for extension is required.');
    }

    const homework = await this._homeworkRepo.findById(dto.homeworkId);
    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    const submission = homework.submissions.find((s) => s.studentId === student.id!);
    if (!submission) {
      throw new BadRequestError('This homework is not assigned to you.');
    }

    if (new Date() <= homework.dueDate) {
      throw new BadRequestError('Deadline has not yet passed. You can submit normally.');
    }

    if (submission.extensionRequest && submission.extensionRequest.status === 'pending') {
      throw new BadRequestError('You already have a pending extension request for this homework.');
    }

    homework.requestExtension(
      student.id!,
      dto.reason,
      dto.explanation,
      dto.attachment
        ? {
            fileName: dto.attachment.fileName,
            fileUrl: dto.attachment.fileUrl,
            fileType: dto.attachment.fileType,
            fileSize: dto.attachment.fileSize,
          }
        : undefined
    );

    await this._homeworkRepo.update(homework.id!, homework);
  }
}
