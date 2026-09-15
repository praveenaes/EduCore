import { Types } from 'mongoose';
import { SubjectAssignment } from '../../domain/entities/SubjectAssignment';
import { ISubjectAssignmentDocument } from '../../infra/db/models/SubjectAssignmentModel';

export class SubjectAssignmentMapper {
  static toDomain(doc: ISubjectAssignmentDocument | any): SubjectAssignment {
    const courseId = doc.courseId?._id ? doc.courseId._id.toString() : doc.courseId?.toString();
    const subjectId = doc.subjectId?._id ? doc.subjectId._id.toString() : doc.subjectId?.toString();
    const teacherId = doc.teacherId?._id ? doc.teacherId._id.toString() : (doc.teacherId ? doc.teacherId.toString() : undefined);

    const courseName = doc.courseId?.name;
    const courseCode = doc.courseId?.code;
    const subjectName = doc.subjectId?.name;
    const subjectCode = doc.subjectId?.code;
    const teacherName = doc.teacherId
      ? `${doc.teacherId.firstName || ''} ${doc.teacherId.lastName || ''}`.trim()
      : undefined;
    const teacherEmployeeId = doc.teacherId?.employeeId;

    return new SubjectAssignment({
      id: doc._id.toString(),
      courseId,
      levelNumber: doc.levelNumber,
      levelName: doc.levelName,
      subjectId,
      teacherId,
      isDeleted: Boolean(doc.isDeleted),
      courseName,
      courseCode,
      subjectName,
      subjectCode,
      teacherName,
      teacherEmployeeId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: SubjectAssignment): Record<string, any> {
    return {
      courseId: new Types.ObjectId(entity.courseId),
      levelNumber: entity.levelNumber,
      levelName: entity.levelName,
      subjectId: new Types.ObjectId(entity.subjectId),
      teacherId: entity.teacherId ? new Types.ObjectId(entity.teacherId) : null,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<SubjectAssignment>): Record<string, any> {
    const updateData: Record<string, any> = {};

    if (entity.courseId !== undefined) updateData.courseId = new Types.ObjectId(entity.courseId);
    if (entity.levelNumber !== undefined) updateData.levelNumber = entity.levelNumber;
    if (entity.levelName !== undefined) updateData.levelName = entity.levelName;
    if (entity.subjectId !== undefined) updateData.subjectId = new Types.ObjectId(entity.subjectId);
    if (entity.teacherId !== undefined) {
      updateData.teacherId = entity.teacherId ? new Types.ObjectId(entity.teacherId) : null;
    }
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    return updateData;
  }
}
