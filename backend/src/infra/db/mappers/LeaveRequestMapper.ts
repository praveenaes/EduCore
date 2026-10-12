import { Types } from 'mongoose';
import { LeaveRequest } from '../../../domain/entities/LeaveRequest';

export class LeaveRequestMapper {
  static toDomain(doc: any): LeaveRequest {
    const studentId = doc.studentId?._id
      ? doc.studentId._id.toString()
      : doc.studentId?.toString();
    const batchId = doc.batchId?._id
      ? doc.batchId._id.toString()
      : doc.batchId?.toString();
    const reviewedBy = doc.reviewedBy?._id
      ? doc.reviewedBy._id.toString()
      : doc.reviewedBy?.toString();

    const studentName = doc.studentId?.firstName
      ? `${doc.studentId.firstName || ''} ${doc.studentId.lastName || ''}`.trim()
      : undefined;
    const admissionNumber = doc.studentId?.admissionNumber;
    const batchName = doc.batchId?.name;
    const reviewerName = doc.reviewedBy?.name;

    return new LeaveRequest({
      id: doc._id.toString(),
      studentId,
      batchId,
      startDate: doc.startDate,
      endDate: doc.endDate,
      type: doc.type,
      reason: doc.reason,
      status: doc.status,
      appliedAt: doc.appliedAt,
      isHalfDay: Boolean(doc.isHalfDay),
      halfDaySession: doc.halfDaySession ?? undefined,
      reviewedBy,
      reviewedAt: doc.reviewedAt,
      remarks: doc.remarks,
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      studentName,
      admissionNumber,
      batchName,
      reviewerName,
    });
  }

  static toPersistence(entity: LeaveRequest): {
    studentId: Types.ObjectId;
    batchId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    type: string;
    reason: string;
    status: string;
    appliedAt: Date;
    isHalfDay: boolean;
    halfDaySession?: string;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    remarks?: string;
    isDeleted: boolean;
  } {
    return {
      studentId: new Types.ObjectId(entity.studentId),
      batchId: new Types.ObjectId(entity.batchId),
      startDate: entity.startDate,
      endDate: entity.endDate,
      type: entity.type,
      reason: entity.reason,
      status: entity.status,
      appliedAt: entity.appliedAt,
      isHalfDay: entity.isHalfDay,
      halfDaySession: entity.halfDaySession,
      reviewedBy: entity.reviewedBy ? new Types.ObjectId(entity.reviewedBy) : undefined,
      reviewedAt: entity.reviewedAt,
      remarks: entity.remarks ?? '',
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<LeaveRequest>): Record<string, any> {
    const data: Record<string, any> = {};

    if (entity.studentId !== undefined) data.studentId = new Types.ObjectId(entity.studentId);
    if (entity.batchId !== undefined) data.batchId = new Types.ObjectId(entity.batchId);
    if (entity.startDate !== undefined) data.startDate = entity.startDate;
    if (entity.endDate !== undefined) data.endDate = entity.endDate;
    if (entity.type !== undefined) data.type = entity.type;
    if (entity.reason !== undefined) data.reason = entity.reason.trim();
    if (entity.status !== undefined) data.status = entity.status;
    if (entity.appliedAt !== undefined) data.appliedAt = entity.appliedAt;
    if (entity.isHalfDay !== undefined) data.isHalfDay = entity.isHalfDay;
    if (entity.halfDaySession !== undefined) data.halfDaySession = entity.halfDaySession;
    if (entity.reviewedBy !== undefined) data.reviewedBy = entity.reviewedBy ? new Types.ObjectId(entity.reviewedBy) : undefined;
    if (entity.reviewedAt !== undefined) data.reviewedAt = entity.reviewedAt;
    if (entity.remarks !== undefined) data.remarks = entity.remarks.trim();
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    return data;
  }
}
