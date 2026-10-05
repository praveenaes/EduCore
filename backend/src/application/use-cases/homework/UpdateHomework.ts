import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IUpdateHomeworkUseCase } from '@/application/ports/use-cases/homework/IUpdateHomeworkUseCase';
import {
  UpdateHomeworkDTO,
  TeacherHomeworkItemDTO,
} from '@/application/dto/homework/homeworkDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class UpdateHomework implements IUpdateHomeworkUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(dto: UpdateHomeworkDTO): Promise<TeacherHomeworkItemDTO> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const homework = await this._homeworkRepo.findById(dto.homeworkId);
    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    if (homework.assignedBy !== teacher.id) {
      throw new ForbiddenError('You are not authorized to update this homework.');
    }

    if (homework.verifiedCount > 0) {
      throw new BadRequestError('Cannot edit homework. Some student submissions have already been verified.');
    }

    let parsedDueDate: Date | undefined;
    if (dto.dueDate) {
      parsedDueDate = new Date(dto.dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        throw new BadRequestError('Invalid due date format.');
      }
    }

    homework.updateDetails({
      title: dto.title,
      description: dto.description,
      dueDate: parsedDueDate,
      attachments: dto.attachments?.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
    });

    const updated = await this._homeworkRepo.update(homework.id!, homework);
    const result = updated || homework;

    return {
      id: result.id!,
      title: result.title,
      description: result.description,
      batchId: result.batchId,
      batchName: result.batchName,
      subjectId: result.subjectId,
      assignedBy: result.assignedBy,
      teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
      dueDate: result.dueDate.toISOString(),
      attachments: result.attachments.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      totalStudents: result.totalStudents,
      submittedCount: result.submittedCount,
      verifiedCount: result.verifiedCount,
      isActive: result.isActive,
      createdAt: result.createdAt?.toISOString(),
      updatedAt: result.updatedAt?.toISOString(),
    };
  }
}
