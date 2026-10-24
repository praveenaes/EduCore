import { Types } from 'mongoose';
import { Assessment, AssessmentStatus } from '../../../domain/entities/Assessment';

export class AssessmentMapper {
  static toDomain(doc: any): Assessment {
    const academicYearId = doc.academicYearId?._id
      ? doc.academicYearId._id.toString()
      : doc.academicYearId?.toString();

    return new Assessment({
      id: doc._id.toString(),
      name: doc.name,
      academicYearId,
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status as AssessmentStatus,
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      // Populated fields
      academicYearName: doc.academicYearId?.name,
      academicYearCode: doc.academicYearId?.code,
    });
  }

  static toPersistence(entity: Assessment): Record<string, any> {
    return {
      name: entity.name,
      academicYearId: new Types.ObjectId(entity.academicYearId),
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<Assessment>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.name !== undefined) data.name = entity.name;
    if (entity.academicYearId !== undefined) data.academicYearId = new Types.ObjectId(entity.academicYearId);
    if (entity.startDate !== undefined) data.startDate = entity.startDate;
    if (entity.endDate !== undefined) data.endDate = entity.endDate;
    if (entity.status !== undefined) data.status = entity.status;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;
    return data;
  }
}
