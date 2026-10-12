import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ISubmitHomeworkUseCase } from '@/application/ports/use-cases/homework/ISubmitHomeworkUseCase';
import { SubmitHomeworkDTO } from '@/application/dto/homework/homeworkDtos';
import { NotFoundError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class SubmitHomework implements ISubmitHomeworkUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(dto: SubmitHomeworkDTO): Promise<void> {
    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }

    if (!dto.attachments || dto.attachments.length === 0) {
      throw new BadRequestError('Please attach at least one solution file.');
    }

    // Find homework where this student is assigned
    let homework = await this._homeworkRepo.findById(dto.participantId);

    if (!homework) {
      const studentHws = await this._homeworkRepo.findStudentHomeworks(
        { studentId: student.id! },
        { page: 1, limit: 100 }
      );
      homework =
        studentHws.homeworks.find(
          (h) =>
            h.id === dto.participantId ||
            h.submissions.some((s) => s.id === dto.participantId || s.studentId === student.id!)
        ) || null;
    }

    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    const submission = homework.submissions.find((s) => s.studentId === student.id!);
    if (!submission) {
      throw new BadRequestError('This homework is not assigned to you.');
    }

    if (new Date() > homework.dueDate) {
      throw new BadRequestError('Deadline is over');
    }

    await this._homeworkRepo.updateSubmission(homework.id!, student.id!, {
      status: 'submitted',
      submittedAt: new Date(),
      attachments: dto.attachments.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
    });
  }
}
