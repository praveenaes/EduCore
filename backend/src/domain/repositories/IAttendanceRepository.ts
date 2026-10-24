import { Attendance } from '../entities/Attendance';
import { IBaseRepository } from './IBaseRepository';

export interface IAttendanceRepository extends IBaseRepository<Attendance> {
  findByBatchAndDate(batchId: string, date: Date): Promise<Attendance[]>;
  findByStudentAndMonth(studentId: string, month: number, year: number): Promise<Attendance[]>;
  upsertMany(records: Attendance[]): Promise<Attendance[]>;
  deleteByStudentAndDateRange(
    studentId: string,
    batchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void>;
}
