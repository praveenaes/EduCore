import { Types } from 'mongoose';
import {
  AssessmentCriteria,
  AssessmentCriteriaType,
} from '../../../domain/entities/AssessmentCriteria';
import { IAssessmentCriteriaDocument } from '../models/AssessmentCriteriaModel';

export class AssessmentCriteriaMapper {
  static toDomain(doc: IAssessmentCriteriaDocument | any): AssessmentCriteria {
    const courseId = doc.courseId?._id
      ? doc.courseId._id.toString()
      : doc.courseId?.toString();

    const subjectId = doc.subjectId?._id
      ? doc.subjectId._id.toString()
      : doc.subjectId?.toString();

    const courseName = doc.courseId?.name;
    const courseCode = doc.courseId?.code;
    const levelName = doc.courseId?.levelName;
    const subjectName = doc.subjectId?.name;
    const subjectCode = doc.subjectId?.code;

    return new AssessmentCriteria({
      id: doc._id.toString(),
      name: doc.name,
      courseId,
      levelNumber: doc.levelNumber,
      subjectId,
      assessmentType: doc.assessmentType as AssessmentCriteriaType,
      maxMarks: doc.maxMarks,
      passMarks: doc.passMarks,
      hasCe: Boolean(doc.hasCe),
      isDeleted: Boolean(doc.isDeleted),
      courseName,
      courseCode,
      levelName,
      subjectName,
      subjectCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: AssessmentCriteria): Record<string, any> {
    return {
      name: entity.name,
      courseId: new Types.ObjectId(entity.courseId),
      levelNumber: entity.levelNumber,
      subjectId: new Types.ObjectId(entity.subjectId),
      assessmentType: entity.assessmentType,
      maxMarks: entity.maxMarks,
      passMarks: entity.passMarks,
      hasCe: entity.hasCe,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<AssessmentCriteria>): Record<string, any> {
    const data: Record<string, any> = {};

    if (entity.name !== undefined) data.name = entity.name;
    if (entity.courseId !== undefined) data.courseId = new Types.ObjectId(entity.courseId);
    if (entity.levelNumber !== undefined) data.levelNumber = entity.levelNumber;
    if (entity.subjectId !== undefined) data.subjectId = new Types.ObjectId(entity.subjectId);
    if (entity.assessmentType !== undefined) data.assessmentType = entity.assessmentType;
    if (entity.maxMarks !== undefined) data.maxMarks = entity.maxMarks;
    if (entity.passMarks !== undefined) data.passMarks = entity.passMarks;
    if (entity.hasCe !== undefined) data.hasCe = entity.hasCe;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;

    return data;
  }
}
