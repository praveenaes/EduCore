import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ICreateHomeworkUseCase } from '@/application/ports/use-cases/homework/ICreateHomeworkUseCase';
import {
  CreateHomeworkDTO,
  TeacherHomeworkItemDTO,
} from '@/application/dto/homework/homeworkDtos';
import { Homework } from '@/domain/entities/Homework';
import { NotFoundError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class CreateHomework implements ICreateHomeworkUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(dto: CreateHomeworkDTO): Promise<TeacherHomeworkItemDTO> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestError('Homework title is required.');
    }

    if (!dto.batchId) {
      throw new BadRequestError('Batch ID is required.');
    }

    const batch = await this._batchRepo.findById(dto.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Batch not found.');
    }

    const dueDate = new Date(dto.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestError('Invalid due date format.');
    }

    // Retrieve active enrolled students in this batch
    const students = await this._studentRepo.findByBatchId(dto.batchId);
    const studentIds = students.map((s) => s.id!).filter(Boolean);

    const newHomework = Homework.createNew({
      title: dto.title,
      description: dto.description,
      batchId: dto.batchId,
      subjectId: dto.subjectId,
      assignedBy: teacher.id!,
      dueDate,
      attachments: dto.attachments?.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      studentIds,
    });

    const saved = await this._homeworkRepo.create(newHomework);

    return {
      id: saved.id!,
      title: saved.title,
      description: saved.description,
      batchId: saved.batchId,
      batchName: batch.name,
      subjectId: saved.subjectId,
      assignedBy: saved.assignedBy,
      teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
      dueDate: saved.dueDate.toISOString(),
      attachments: saved.attachments.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      totalStudents: saved.totalStudents,
      submittedCount: saved.submittedCount,
      verifiedCount: saved.verifiedCount,
      isActive: saved.isActive,
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };
  }
}
