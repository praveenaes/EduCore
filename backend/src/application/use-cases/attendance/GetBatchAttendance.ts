import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { Attendance } from '@/domain/entities/Attendance';
import { IGetBatchAttendanceUseCase } from '../../ports/use-cases/attendance/IGetBatchAttendanceUseCase';
import {
  GetBatchAttendanceDTO,
  BatchAttendanceResponseDTO,
  AttendanceRecordDTO,
} from '../../dto/attendance/attendanceDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class GetBatchAttendance implements IGetBatchAttendanceUseCase {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(dto: GetBatchAttendanceDTO): Promise<BatchAttendanceResponseDTO> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    if (!dto.batchId) {
      throw new BadRequestError('Batch ID is required.');
    }

    if (!dto.date) {
      throw new BadRequestError('Date is required.');
    }

    const batch = await this._batchRepo.findById(dto.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Batch not found.');
    }

    if (batch.teacherId && batch.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to view attendance for this batch.');
    }

    const attendanceDate = new Date(dto.date);
    if (isNaN(attendanceDate.getTime())) {
      throw new BadRequestError('Invalid date format.');
    }

    const [students, existingRecords] = await Promise.all([
      this._studentRepo.findByBatchId(dto.batchId),
      this._attendanceRepo.findByBatchAndDate(dto.batchId, attendanceDate),
    ]);

    const attendanceMap = new Map<string, Attendance>();
    for (const record of existingRecords) {
      attendanceMap.set(record.studentId, record);
    }

    const records: AttendanceRecordDTO[] = students.map((student) => {
      const existing = attendanceMap.get(student.id!);
      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

      return {
        id: existing?.id,
        studentId: student.id!,
        admissionNumber: student.admissionNumber,
        studentName,
        firstHalf: existing ? existing.firstHalf : 'absent',
        secondHalf: existing ? existing.secondHalf : 'absent',
        remarks: existing?.remarks ?? '',
      };
    });

    return {
      batchId: batch.id!,
      batchName: batch.name,
      date: dto.date,
      records,
    };
  }
}
