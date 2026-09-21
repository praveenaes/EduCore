import { Types } from 'mongoose';
import { Batch } from '../../domain/entities/Batch';

export class BatchMapper {
  static toDomain(doc: any): Batch {
    const courseId = doc.courseId?._id
      ? doc.courseId._id.toString()
      : doc.courseId?.toString();
    const centerId = doc.centerId?._id
      ? doc.centerId._id.toString()
      : doc.centerId?.toString();
    const academicYearId = doc.academicYearId?._id
      ? doc.academicYearId._id.toString()
      : doc.academicYearId?.toString();
    const teacherId = doc.teacherId?._id
      ? doc.teacherId._id.toString()
      : doc.teacherId
        ? doc.teacherId.toString()
        : undefined;

    return new Batch({
      id:            doc._id.toString(),
      name:          doc.name,
      courseId,
      levelNumber:   doc.levelNumber,
      levelName:     doc.levelName,
      centerId,
      academicYearId,
      teacherId,
      isActive:      Boolean(doc.isActive),
      isDeleted:     Boolean(doc.isDeleted),
      createdAt:     doc.createdAt,
      updatedAt:     doc.updatedAt,
      // Populated display fields
      courseName:             doc.courseId?.name,
      courseCode:             doc.courseId?.code,
      centerName:             doc.centerId?.name,
      academicYearName:       doc.academicYearId?.name,
      teacherName:       doc.teacherId
        ? `${doc.teacherId.firstName || ''} ${doc.teacherId.lastName || ''}`.trim()
        : undefined,
      teacherEmployeeId: doc.teacherId?.employeeId,
    });
  }

  static toPersistence(entity: Batch): Record<string, any> {
    return {
      name:           entity.name,
      courseId:       new Types.ObjectId(entity.courseId),
      levelNumber:    entity.levelNumber,
      levelName:      entity.levelName,
      centerId:       new Types.ObjectId(entity.centerId),
      academicYearId: new Types.ObjectId(entity.academicYearId),
      teacherId:      entity.teacherId ? new Types.ObjectId(entity.teacherId) : null,
      isActive:       entity.isActive,
      isDeleted:      entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<Batch>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.name           !== undefined) data.name           = entity.name;
    if (entity.courseId       !== undefined) data.courseId       = new Types.ObjectId(entity.courseId);
    if (entity.levelNumber    !== undefined) data.levelNumber    = entity.levelNumber;
    if (entity.levelName      !== undefined) data.levelName      = entity.levelName;
    if (entity.centerId       !== undefined) data.centerId       = new Types.ObjectId(entity.centerId);
    if (entity.academicYearId !== undefined) data.academicYearId = new Types.ObjectId(entity.academicYearId);
    if (entity.isActive       !== undefined) data.isActive       = entity.isActive;
    if (entity.isDeleted      !== undefined) data.isDeleted      = entity.isDeleted;
    // Always write teacherId when entity was updated (updatedAt present means entity was touched)
    if (entity.updatedAt !== undefined) {
      data.teacherId = entity.teacherId
        ? new Types.ObjectId(entity.teacherId)
        : null;
      data.updatedAt = entity.updatedAt;
    }
    return data;
  }
}
