import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { Attendance } from '@/domain/entities/Attendance';
import { ICreateBatchAttendanceUseCase } from '../../ports/use-cases/attendance/ICreateBatchAttendanceUseCase';
import {
  CreateBatchAttendanceDTO,
  BatchAttendanceResponseDTO,
} from '../../dto/attendance/attendanceDtos';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '@/shared/errors/AppError';

@injectable()
export class CreateBatchAttendance implements ICreateBatchAttendanceUseCase {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(dto: CreateBatchAttendanceDTO): Promise<BatchAttendanceResponseDTO> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const batch = await this._batchRepo.findById(dto.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Batch not found.');
    }

    if (batch.teacherId && batch.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to create attendance for this batch.');
    }

    const attendanceDate = new Date(dto.date);
    if (isNaN(attendanceDate.getTime())) {
      throw new BadRequestError('Invalid date format.');
    }

    const existingRecords = await this._attendanceRepo.findByBatchAndDate(
      dto.batchId,
      attendanceDate
    );

    if (existingRecords.length > 0) {
      throw new ConflictError(
        'Attendance has already been recorded for this date. Please use update instead.'
      );
    }

    const newEntities: Attendance[] = dto.attendances.map((item) =>
      Attendance.createNew({
        studentId: item.studentId,
        batchId: dto.batchId,
        date: attendanceDate,
        firstHalf: item.firstHalf,
        secondHalf: item.secondHalf,
        remarks: item.remarks,
        markedBy: dto.userId,
      })
    );

    const savedRecords = await this._attendanceRepo.upsertMany(newEntities);

    return {
      batchId: batch.id!,
      batchName: batch.name,
      date: dto.date,
      records: savedRecords.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        admissionNumber: r.admissionNumber ?? '',
        studentName: r.studentName ?? '',
        firstHalf: r.firstHalf,
        secondHalf: r.secondHalf,
        remarks: r.remarks ?? '',
      })),
    };
  }
}
