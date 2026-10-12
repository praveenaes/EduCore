import { injectable } from 'inversify';
import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { Attendance } from '../../domain/entities/Attendance';
import { AttendanceModel, IAttendanceDocument } from './models/AttendanceModel';
import { AttendanceMapper } from './mappers/AttendanceMapper';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoAttendanceRepository
  extends BaseMongoRepository<Attendance, IAttendanceDocument>
  implements IAttendanceRepository
{
  protected readonly _model = AttendanceModel;
  protected readonly _mapper = AttendanceMapper;
 
  //for teacher
  async findByBatchAndDate(batchId: string, date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const docs = await AttendanceModel.find({
      batchId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
    }).populate('studentId', 'firstName lastName admissionNumber');

    return docs.map((doc) => AttendanceMapper.toDomain(doc));
  }

 

  //for student
  async findByStudentAndMonth(
    studentId: string,
    month: number,
    year: number
  ): Promise<Attendance[]> {
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const docs = await AttendanceModel.find({
      studentId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
    }).sort({ date: 1 });

    return docs.map((doc) => AttendanceMapper.toDomain(doc));
  }

  //for teacher
  async upsertMany(records: Attendance[]): Promise<Attendance[]> {
    const results = await Promise.all(
      records.map(async (record) => {
        const startOfDay = new Date(record.date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const persistenceData = AttendanceMapper.toPersistence(record);
        persistenceData.date = startOfDay;

        const doc = await AttendanceModel.findOneAndUpdate(
          {
            studentId: persistenceData.studentId,
            date: startOfDay,
            isDeleted: false,
          },
          {
            $set: persistenceData,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        ).populate('studentId', 'firstName lastName admissionNumber');

        return AttendanceMapper.toDomain(doc);
      })
    );

    return results;
  }
}
