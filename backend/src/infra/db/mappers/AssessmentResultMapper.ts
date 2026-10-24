import { Types } from 'mongoose';
import { AssessmentResult } from '../../../domain/entities/AssessmentResult';

export class AssessmentResultMapper {
  static toDomain(doc: any): AssessmentResult {
    const assessmentId = doc.assessmentId?._id
      ? doc.assessmentId._id.toString()
      : doc.assessmentId?.toString();

    const scheduleId = doc.scheduleId?._id
      ? doc.scheduleId._id.toString()
      : doc.scheduleId?.toString();

    const criteriaId = doc.criteriaId?._id
      ? doc.criteriaId._id.toString()
      : doc.criteriaId?.toString();

    const batchId = doc.batchId?._id
      ? doc.batchId._id.toString()
      : doc.batchId?.toString();

    const studentId = doc.studentId?._id
      ? doc.studentId._id.toString()
      : doc.studentId?.toString();

    // Populated student display details
    const studentName = doc.studentId
      ? `${doc.studentId.firstName || ''} ${doc.studentId.lastName || ''}`.trim()
      : undefined;
    const admissionNumber = doc.studentId?.admissionNumber;
    const studentEmail = doc.studentId?.email;

    // Populated event and batch details
    const assessmentName = doc.assessmentId?.name;
    const batchName = doc.batchId?.name;

    // Populated criteria and subject details
    const criteriaName = doc.criteriaId?.name;
    const courseId = doc.criteriaId?.courseId?._id
      ? doc.criteriaId.courseId._id.toString()
      : doc.criteriaId?.courseId?.toString();
    const courseName = doc.criteriaId?.courseId?.name;
    const courseCode = doc.criteriaId?.courseId?.code;
    const levelNumber = doc.criteriaId?.levelNumber;
    const subjectName = doc.criteriaId?.subjectId?.name;
    const subjectCode = doc.criteriaId?.subjectId?.code;
    const maxMarks = doc.criteriaId?.maxMarks;
    const passMarks = doc.criteriaId?.passMarks;
    const hasCe = doc.criteriaId?.hasCe;

    return new AssessmentResult({
      id: doc._id.toString(),
      assessmentId,
      scheduleId,
      criteriaId,
      batchId,
      studentId,
      marksObtained: doc.marksObtained ?? 0,
      ceMarksObtained: doc.ceMarksObtained ?? 0,
      isAbsent: Boolean(doc.isAbsent),
      isPassed: Boolean(doc.isPassed),
      remarks: doc.remarks || '',
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,

      // Populated display fields
      studentName,
      admissionNumber,
      studentEmail,
      assessmentName,
      courseId,
      courseName,
      courseCode,
      levelNumber,
      batchName,
      criteriaName,
      subjectName,
      subjectCode,
      maxMarks,
      passMarks,
      hasCe,
    });
  }

  static toPersistence(entity: AssessmentResult): Record<string, any> {
    return {
      assessmentId: new Types.ObjectId(entity.assessmentId),
      scheduleId: new Types.ObjectId(entity.scheduleId),
      criteriaId: new Types.ObjectId(entity.criteriaId),
      batchId: new Types.ObjectId(entity.batchId),
      studentId: new Types.ObjectId(entity.studentId),
      marksObtained: entity.marksObtained,
      ceMarksObtained: entity.ceMarksObtained ?? 0,
      isAbsent: entity.isAbsent,
      isPassed: entity.isPassed,
      remarks: entity.remarks || '',
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<AssessmentResult>): Record<string, any> {
    const data: Record<string, any> = {};

    if (entity.assessmentId !== undefined) data.assessmentId = new Types.ObjectId(entity.assessmentId);
    if (entity.scheduleId !== undefined) data.scheduleId = new Types.ObjectId(entity.scheduleId);
    if (entity.criteriaId !== undefined) data.criteriaId = new Types.ObjectId(entity.criteriaId);
    if (entity.batchId !== undefined) data.batchId = new Types.ObjectId(entity.batchId);
    if (entity.studentId !== undefined) data.studentId = new Types.ObjectId(entity.studentId);
    if (entity.marksObtained !== undefined) data.marksObtained = entity.marksObtained;
    if (entity.ceMarksObtained !== undefined) data.ceMarksObtained = entity.ceMarksObtained;
    if (entity.isAbsent !== undefined) data.isAbsent = entity.isAbsent;
    if (entity.isPassed !== undefined) data.isPassed = entity.isPassed;
    if (entity.remarks !== undefined) data.remarks = entity.remarks;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    if (entity.updatedAt !== undefined) data.updatedAt = entity.updatedAt;

    return data;
  }
}
