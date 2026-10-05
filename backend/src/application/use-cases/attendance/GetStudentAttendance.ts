import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { IGetStudentAttendanceUseCase } from '../../ports/use-cases/attendance/IGetStudentAttendanceUseCase';
import {
  GetStudentAttendanceDTO,
  StudentMonthlyAttendanceResponseDTO,
  StudentDayAttendanceDTO,
} from '../../dto/attendance/attendanceDtos';
import { NotFoundError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class GetStudentAttendance implements IGetStudentAttendanceUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(
    dto: GetStudentAttendanceDTO
  ): Promise<StudentMonthlyAttendanceResponseDTO> {
    if (!dto.userId) {
      throw new BadRequestError('User ID is required.');
    }

    if (!dto.month || dto.month < 1 || dto.month > 12) {
      throw new BadRequestError('A valid month between 1 and 12 is required.');
    }

    if (!dto.year || dto.year < 2000) {
      throw new BadRequestError('A valid year is required.');
    }

    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }

    const attendanceRecords = await this._attendanceRepo.findByStudentAndMonth(
      student.id!,
      dto.month,
      dto.year
    );

    let presentDays = 0;
    let absentDays = 0;
    let partialDays = 0;

    const records: StudentDayAttendanceDTO[] = attendanceRecords.map((rec) => {
      const dateStr =
        rec.date instanceof Date
          ? rec.date.toISOString().slice(0, 10)//taking the first 10 characters YYYY-MM-DD
          : String(rec.date).slice(0, 10);

      if (rec.firstHalf === 'present' && rec.secondHalf === 'present') {
        presentDays++;
      } else if (rec.firstHalf === 'absent' && rec.secondHalf === 'absent') {
        absentDays++;
      } else {
        partialDays++;
      }
   
      //return every single day attendence
      return {
        id: rec.id,
        date: dateStr,
        firstHalf: rec.firstHalf,
        secondHalf: rec.secondHalf,
        remarks: rec.remarks,
      };
    });
   
    const totalDays = records.length;
    const percentage =
      totalDays > 0
        ? Math.round(((presentDays + partialDays * 0.5) / totalDays) * 100)
        : 0;

        //returns whole data
    return {
      month: dto.month,
      year: dto.year,
      records,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        partialDays,
        percentage,
      },
    };
  }
}
