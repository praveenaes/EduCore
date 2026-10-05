import { Types } from 'mongoose';
import { Attendance } from '../../../domain/entities/Attendance';

export class AttendanceMapper {
  static toDomain(doc: any): Attendance {
    const studentId = doc.studentId?._id
      ? doc.studentId._id.toString()
      : doc.studentId?.toString();
    const batchId = doc.batchId?._id
      ? doc.batchId._id.toString()
      : doc.batchId?.toString();
    const markedBy = doc.markedBy?._id
      ? doc.markedBy._id.toString()
      : doc.markedBy?.toString();

    const studentName = doc.studentId?.firstName
      ? `${doc.studentId.firstName || ''} ${doc.studentId.lastName || ''}`.trim()
      : undefined;
    const admissionNumber = doc.studentId?.admissionNumber;

    return new Attendance({
      id: doc._id.toString(),
      studentId,
      batchId,
      date: doc.date,
      firstHalf: doc.firstHalf,
      secondHalf: doc.secondHalf,
      remarks: doc.remarks,
      markedBy,
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      studentName,
      admissionNumber,
    });
  }

  static toPersistence(entity: Attendance): {
    studentId: Types.ObjectId;
    batchId: Types.ObjectId;
    date: Date;
    firstHalf: string;
    secondHalf: string;
    remarks?: string;
    markedBy: Types.ObjectId;
    isDeleted: boolean;
  } {
    return {
      studentId: new Types.ObjectId(entity.studentId),
      batchId: new Types.ObjectId(entity.batchId),
      date: entity.date,
      firstHalf: entity.firstHalf,
      secondHalf: entity.secondHalf,
      remarks: entity.remarks ?? '',
      markedBy: new Types.ObjectId(entity.markedBy),
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<Attendance>): Record<string, any> {
    const data: Record<string, any> = {};

    if (entity.studentId !== undefined) data.studentId = new Types.ObjectId(entity.studentId);
    if (entity.batchId !== undefined) data.batchId = new Types.ObjectId(entity.batchId);
    if (entity.date !== undefined) data.date = entity.date;
    if (entity.firstHalf !== undefined) data.firstHalf = entity.firstHalf;
    if (entity.secondHalf !== undefined) data.secondHalf = entity.secondHalf;
    if (entity.remarks !== undefined) data.remarks = entity.remarks.trim();
    if (entity.markedBy !== undefined) data.markedBy = new Types.ObjectId(entity.markedBy);
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    return data;
  }
}
