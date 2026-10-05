import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IHomeworkRepository } from '@/domain/repositories/IHomeworkRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IGetStudentHomeworksUseCase } from '@/application/ports/use-cases/homework/IGetStudentHomeworksUseCase';
import {
  GetStudentHomeworksDTO,
  StudentHomeworkListResponseDTO,
  StudentHomeworkItemDTO,
} from '@/application/dto/homework/homeworkDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetStudentHomeworks implements IGetStudentHomeworksUseCase {
  constructor(
    @inject(TYPES.HomeworkRepository) private _homeworkRepo: IHomeworkRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(dto: GetStudentHomeworksDTO): Promise<StudentHomeworkListResponseDTO> {
    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;

    const result = await this._homeworkRepo.findStudentHomeworks(
      {
        studentId: student.id!,
        status: dto.status,
      },
      { page, limit }
    );

    const homeworks: StudentHomeworkItemDTO[] = result.homeworks.map((hw) => {
      const mySubmission = hw.submissions.find((s) => s.studentId === student.id!);

      return {
        participantId: mySubmission?.id || student.id!,
        homeworkId: hw.id!,
        title: hw.title,
        description: hw.description,
        subjectName: hw.subjectName || 'Subject',
        teacherName: hw.teacherName || 'Teacher',
        dueDate: hw.dueDate.toISOString(),
        status: mySubmission?.status || 'pending',
        submittedAt: mySubmission?.submittedAt ? mySubmission.submittedAt.toISOString() : null,
        verifiedAt: mySubmission?.verifiedAt ? mySubmission.verifiedAt.toISOString() : null,
        remarks: mySubmission?.remarks || '',
        teacherAttachments: hw.attachments.map((a) => ({
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
        })),
        submissionAttachments: (mySubmission?.attachments || []).map((a) => ({
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
        })),
      };
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      homeworks,
      total: result.total,
      page,
      totalPages,
    };
  }
}
