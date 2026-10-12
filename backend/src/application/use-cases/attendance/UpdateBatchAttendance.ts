import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { Attendance } from '@/domain/entities/Attendance';
import { IUpdateBatchAttendanceUseCase } from '../../ports/use-cases/attendance/IUpdateBatchAttendanceUseCase';
import {
  UpdateBatchAttendanceDTO,
  BatchAttendanceResponseDTO,
} from '../../dto/attendance/attendanceDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

const FIRST_HALF_START_MINUTES = 11 * 60 + 30; //  (11:30 AM)
const FIRST_HALF_END_MINUTES = 13 * 60 + 30;   //  (01:30 PM)
const SECOND_HALF_START_MINUTES = 15 * 60;      //  (03:00 PM)
const SECOND_HALF_END_MINUTES = 16 * 60 + 30;  //  (04:30 PM)

function getIstDateAndMinutes(): { todayDateString: string; currentMinutes: number } {
  const now = new Date();

  // Format today's date as YYYY-MM-DD 
  const todayDateString = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  // Get current hour and minute (18:50)
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = timeFormatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const currentMinutes = hour * 60 + minute;

  return { todayDateString, currentMinutes };
}

@injectable()
export class UpdateBatchAttendance implements IUpdateBatchAttendanceUseCase {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(dto: UpdateBatchAttendanceDTO): Promise<BatchAttendanceResponseDTO> {
    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) {
      throw new NotFoundError('Teacher profile not found.');
    }

    const batch = await this._batchRepo.findById(dto.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Batch not found.');
    }

    if (batch.teacherId && batch.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to update attendance for this batch.');
    }

    const attendanceDate = new Date(dto.date);
    if (isNaN(attendanceDate.getTime())) {
      throw new BadRequestError('Invalid date format.');
    }

    const { todayDateString, currentMinutes } = getIstDateAndMinutes();
    if (dto.date !== todayDateString) {
      throw new BadRequestError('Attendance can only be marked for today. Past or future dates are not allowed.');
    }

    const isFirstHalfWindow =
      currentMinutes >= FIRST_HALF_START_MINUTES && currentMinutes <= FIRST_HALF_END_MINUTES;
    const isSecondHalfWindow =
      currentMinutes >= SECOND_HALF_START_MINUTES && currentMinutes <= SECOND_HALF_END_MINUTES;

    if (!isFirstHalfWindow && !isSecondHalfWindow) {
      throw new BadRequestError(
        'Attendance marking is currently closed. Allowed windows are: First Half (11:30 AM – 01:30 PM) and Second Half (03:00 PM – 04:30 PM).'
      );
    }

    const existingRecords = await this._attendanceRepo.findByBatchAndDate(
      dto.batchId,
      attendanceDate
    );
  
    // each student existing record==record(some may not have attndnce)
    const existingMap = new Map<string, Attendance>();
    for (const record of existingRecords) {
      existingMap.set(record.studentId, record);
    }

    const attendanceEntities: Attendance[] = dto.attendances.map((item) => {
      // new student cant have existing
      const existing = existingMap.get(item.studentId);

      let targetFirstHalf = item.firstHalf;
      let targetSecondHalf = item.secondHalf;

      if (isFirstHalfWindow) {
        targetFirstHalf = item.firstHalf;
        targetSecondHalf = existing ? existing.secondHalf : 'absent';
      } else if (isSecondHalfWindow) {
        targetFirstHalf = existing ? existing.firstHalf : 'absent';
        targetSecondHalf = item.secondHalf;
      }

      if (existing) {
        existing.updateStatus(
          targetFirstHalf,
          targetSecondHalf,
          item.remarks,
          dto.userId
        );
        return existing;
      }

      return Attendance.createNew({
        studentId: item.studentId,
        batchId: dto.batchId,
        date: attendanceDate,
        firstHalf: targetFirstHalf,
        secondHalf: targetSecondHalf,
        remarks: item.remarks,
        markedBy: dto.userId,
      });
    });

    const savedRecords = await this._attendanceRepo.upsertMany(attendanceEntities);

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
