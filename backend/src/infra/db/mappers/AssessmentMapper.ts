import { Types } from 'mongoose';
import { Assessment, AssessmentStatus } from '../../../domain/entities/Assessment';

export class AssessmentMapper {
  static toDomain(doc: any): Assessment {
    const academicYearId = doc.academicYearId?._id
      ? doc.academicYearId._id.toString()
      : doc.academicYearId?.toString();

    const courseId = doc.courseId?._id
      ? doc.courseId._id.toString()
      : doc.courseId?.toString();

    const levelName =
      doc.courseId?.levels?.find((l: any) => l.levelNumber === doc.levelNumber)?.name ??
      (doc.levelNumber !== undefined ? `Level ${doc.levelNumber}` : undefined);

    return new Assessment({
      id: doc._id.toString(),
      name: doc.name,
      academicYearId,
      courseId,
      levelNumber: Number(doc.levelNumber),
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status as AssessmentStatus,
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      delegationStatus: doc.delegationStatus || 'NONE',
      delegationReason: doc.delegationReason,
      delegatedAt: doc.delegatedAt,
      delegationReviewedAt: doc.delegationReviewedAt,
      // Populated fields
      academicYearName: doc.academicYearId?.name,
      academicYearCode: doc.academicYearId?.code,
      courseName: doc.courseId?.name,
      courseCode: doc.courseId?.code,
      levelName,
    });
  }

  static toPersistence(entity: Assessment): Record<string, any> {
    return {
      name: entity.name,
      academicYearId: new Types.ObjectId(entity.academicYearId),
      courseId: new Types.ObjectId(entity.courseId),
      levelNumber: entity.levelNumber,
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      isDeleted: entity.isDeleted,
      delegationStatus: entity.delegationStatus,
      delegationReason: entity.delegationReason,
      delegatedAt: entity.delegatedAt,
      delegationReviewedAt: entity.delegationReviewedAt,
    };
  }

  static toPersistencePartial(entity: Partial<Assessment>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.name !== undefined) data.name = entity.name;
    if (entity.academicYearId !== undefined) data.academicYearId = new Types.ObjectId(entity.academicYearId);
    if (entity.courseId !== undefined) data.courseId = new Types.ObjectId(entity.courseId);
    if (entity.levelNumber !== undefined) data.levelNumber = entity.levelNumber;
    if (entity.startDate !== undefined) data.startDate = entity.startDate;
    if (entity.endDate !== undefined) data.endDate = entity.endDate;
    if (entity.status !== undefined) data.status = entity.status;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;
    if (entity.delegationStatus !== undefined) data.delegationStatus = entity.delegationStatus;
    if (entity.delegationReason !== undefined) data.delegationReason = entity.delegationReason;
    if (entity.delegatedAt !== undefined) data.delegatedAt = entity.delegatedAt;
    if (entity.delegationReviewedAt !== undefined) data.delegationReviewedAt = entity.delegationReviewedAt;
    return data;
  }
}
