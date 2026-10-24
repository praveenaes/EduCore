import { Types } from 'mongoose';
import { AssessmentSchedule } from '../../../domain/entities/AssessmentSchedule';
import { IAssessmentScheduleDocument } from '../models/AssessmentScheduleModel';

export class AssessmentScheduleMapper {
  static toDomain(doc: IAssessmentScheduleDocument | any): AssessmentSchedule {
    const assessmentId = doc.assessmentId?._id
      ? doc.assessmentId._id.toString()
      : doc.assessmentId?.toString();

    const courseId = doc.courseId?._id
      ? doc.courseId._id.toString()
      : doc.courseId?.toString();

    const criteriaId = doc.criteriaId?._id
      ? doc.criteriaId._id.toString()
      : doc.criteriaId?.toString();

    const batchId = doc.batchId?._id
      ? doc.batchId._id.toString()
      : doc.batchId?.toString();

    const centerId = doc.centerId?._id
      ? doc.centerId._id.toString()
      : doc.centerId?.toString();

    // Populated display helpers
    const assessmentName = doc.assessmentId?.name;
    const courseName = doc.courseId?.name;
    const courseCode = doc.courseId?.code;
    const levelName = doc.courseId?.levelName;
    const criteriaName = doc.criteriaId?.name;
    const subjectId = doc.criteriaId?.subjectId?._id
      ? doc.criteriaId.subjectId._id.toString()
      : doc.criteriaId?.subjectId?.toString();
    const subjectName = doc.criteriaId?.subjectId?.name;
    const subjectCode = doc.criteriaId?.subjectId?.code;
    const batchName = doc.batchId?.name;
    const centerName = doc.centerId?.name;
    const centerCode = doc.centerId?.code;

    return new AssessmentSchedule({
      id: doc._id.toString(),
      assessmentId,
      courseId,
      levelNumber: doc.levelNumber,
      criteriaId,
      batchId,
      centerId,
      examDate: doc.examDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      isCompleted: Boolean(doc.isCompleted),
      isDeleted: Boolean(doc.isDeleted),
      assessmentName,
      courseName,
      courseCode,
      levelName,
      criteriaName,
      subjectId,
      subjectName,
      subjectCode,
      batchName,
      centerName,
      centerCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: AssessmentSchedule): Record<string, any> {
    return {
      assessmentId: new Types.ObjectId(entity.assessmentId),
      courseId: new Types.ObjectId(entity.courseId),
      levelNumber: entity.levelNumber,
      criteriaId: new Types.ObjectId(entity.criteriaId),
      batchId: new Types.ObjectId(entity.batchId),
      centerId: new Types.ObjectId(entity.centerId),
      examDate: entity.examDate,
      startTime: entity.startTime,
      endTime: entity.endTime,
      isCompleted: entity.isCompleted,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<AssessmentSchedule>): Record<string, any> {
    const data: Record<string, any> = {};

    if (entity.assessmentId !== undefined) data.assessmentId = new Types.ObjectId(entity.assessmentId);
    if (entity.courseId !== undefined) data.courseId = new Types.ObjectId(entity.courseId);
    if (entity.levelNumber !== undefined) data.levelNumber = entity.levelNumber;
    if (entity.criteriaId !== undefined) data.criteriaId = new Types.ObjectId(entity.criteriaId);
    if (entity.batchId !== undefined) data.batchId = new Types.ObjectId(entity.batchId);
    if (entity.centerId !== undefined) data.centerId = new Types.ObjectId(entity.centerId);
    if (entity.examDate !== undefined) data.examDate = entity.examDate;
    if (entity.startTime !== undefined) data.startTime = entity.startTime;
    if (entity.endTime !== undefined) data.endTime = entity.endTime;
    if (entity.isCompleted !== undefined) data.isCompleted = entity.isCompleted;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;

    return data;
  }
}
