import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IGetHomeworkSubmissionsUseCase } from '@/application/ports/use-cases/homework/IGetHomeworkSubmissionsUseCase';
import {
  HomeworkSubmissionsResponseDTO,
  HomeworkSubmissionItemDTO,
} from '@/application/dto/homework/homeworkDtos';
import { NotFoundError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class GetHomeworkSubmissions implements IGetHomeworkSubmissionsUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(homeworkId: string, userId: string): Promise<HomeworkSubmissionsResponseDTO> {
    const teacher = await this._teacherRepo.findByUserId(userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const homework = await this._homeworkRepo.findById(homeworkId);
    if (!homework || homework.isDeleted) {
      throw new NotFoundError('Homework assignment not found.');
    }

    if (homework.assignedBy !== teacher.id) {
      throw new ForbiddenError('You are not authorized to view submissions for this homework.');
    }

    const submissions: HomeworkSubmissionItemDTO[] = homework.submissions.map((sub) => ({
      id: sub.id,
      studentId: sub.studentId,
      studentName: sub.studentName || 'Student',
      admissionNumber: sub.admissionNumber || '',
      status: sub.status,
      submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
      verifiedAt: sub.verifiedAt ? sub.verifiedAt.toISOString() : null,
      remarks: sub.remarks || '',
      submissionAttachments: (sub.attachments || []).map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
    }));

    return {
      homework: {
        id: homework.id!,
        title: homework.title,
        description: homework.description,
        batchId: homework.batchId,
        batchName: homework.batchName,
        subjectId: homework.subjectId,
        subjectName: homework.subjectName,
        assignedBy: homework.assignedBy,
        teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
        dueDate: homework.dueDate.toISOString(),
        attachments: homework.attachments.map((a) => ({
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
        })),
        totalStudents: homework.totalStudents,
        submittedCount: homework.submittedCount,
        verifiedCount: homework.verifiedCount,
        isActive: homework.isActive,
        createdAt: homework.createdAt?.toISOString(),
        updatedAt: homework.updatedAt?.toISOString(),
      },
      submissions,
    };
  }
}
