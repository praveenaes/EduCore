import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IGetTeacherHomeworksUseCase } from '@/application/ports/use-cases/homework/IGetTeacherHomeworksUseCase';
import {
  GetTeacherHomeworksDTO,
  TeacherHomeworkListResponseDTO,
  TeacherHomeworkItemDTO,
} from '@/application/dto/homework/homeworkDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetTeacherHomeworks implements IGetTeacherHomeworksUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(dto: GetTeacherHomeworksDTO): Promise<TeacherHomeworkListResponseDTO> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;

    const result = await this._homeworkRepo.findTeacherHomeworks(
      {
        teacherId: teacher.id!,
        batchId: dto.batchId,
        search: dto.search,
      },
      { page, limit }
    );

    const homeworks: TeacherHomeworkItemDTO[] = result.homeworks.map((hw) => ({
      id: hw.id!,
      title: hw.title,
      description: hw.description,
      batchId: hw.batchId,
      batchName: hw.batchName,
      subjectId: hw.subjectId,
      subjectName: hw.subjectName,
      assignedBy: hw.assignedBy,
      teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
      dueDate: hw.dueDate.toISOString(),
      attachments: hw.attachments.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      totalStudents: hw.totalStudents,
      submittedCount: hw.submittedCount,
      verifiedCount: hw.verifiedCount,
      pendingExtensionCount: hw.pendingExtensionCount,
      isActive: hw.isActive,
      createdAt: hw.createdAt?.toISOString(),
      updatedAt: hw.updatedAt?.toISOString(),
    }));

    const totalPages = Math.ceil(result.total / limit);

    return {
      homeworks,
      total: result.total,
      page,
      totalPages,
    };
  }
}
