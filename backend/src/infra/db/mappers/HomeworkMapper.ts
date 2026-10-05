import { Types } from 'mongoose';
import { Homework, HomeworkSubmissionProps } from '../../../domain/entities/Homework';

export class HomeworkMapper {
  static toDomain(doc: any): Homework {
    const batchId = doc.batchId?._id
      ? doc.batchId._id.toString()
      : doc.batchId?.toString();
    const assignedBy = doc.assignedBy?._id
      ? doc.assignedBy._id.toString()
      : doc.assignedBy?.toString();
    const subjectId = doc.subjectId?._id
      ? doc.subjectId._id.toString()
      : doc.subjectId?.toString();

    const batchName = doc.batchId?.name;
    const teacherName = doc.assignedBy?.firstName
      ? `${doc.assignedBy.firstName || ''} ${doc.assignedBy.lastName || ''}`.trim()
      : undefined;
    const subjectName = doc.subjectId?.name || (typeof doc.subjectId === 'string' ? doc.subjectId : undefined);

    const submissions: HomeworkSubmissionProps[] = (doc.submissions || []).map((sub: any) => {
      const studentId = sub.studentId?._id
        ? sub.studentId._id.toString()
        : sub.studentId?.toString();
      const studentName = sub.studentId?.firstName
        ? `${sub.studentId.firstName || ''} ${sub.studentId.lastName || ''}`.trim()
        : undefined;
      const admissionNumber = sub.studentId?.admissionNumber;

      return {
        id: sub._id?.toString(),
        studentId,
        status: sub.status,
        submittedAt: sub.submittedAt,
        verifiedAt: sub.verifiedAt,
        remarks: sub.remarks,
        attachments: (sub.attachments || []).map((att: any) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
        })),
        studentName,
        admissionNumber,
      };
    });

    const attachments = (doc.attachments || []).map((att: any) => ({
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileType: att.fileType,
      fileSize: att.fileSize,
    }));

    return new Homework({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      batchId,
      subjectId,
      assignedBy,
      dueDate: doc.dueDate,
      attachments,
      submissions,
      isActive: Boolean(doc.isActive),
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      batchName,
      subjectName,
      teacherName,
    });
  }

  static toPersistence(entity: Homework): Record<string, any> {
    return {
      title: entity.title,
      description: entity.description ?? '',
      batchId: new Types.ObjectId(entity.batchId),
      subjectId: Types.ObjectId.isValid(entity.subjectId)
        ? new Types.ObjectId(entity.subjectId)
        : entity.subjectId,
      assignedBy: new Types.ObjectId(entity.assignedBy),
      dueDate: entity.dueDate,
      attachments: entity.attachments.map((att) => ({
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        fileSize: att.fileSize,
      })),
      submissions: entity.submissions.map((sub) => ({
        studentId: new Types.ObjectId(sub.studentId),
        status: sub.status,
        submittedAt: sub.submittedAt ?? null,
        verifiedAt: sub.verifiedAt ?? null,
        remarks: sub.remarks ?? '',
        attachments: (sub.attachments || []).map((att) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
        })),
      })),
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<Homework>): Record<string, any> {
    const data: Record<string, any> = {};
    if (entity.title !== undefined) data.title = entity.title;
    if (entity.description !== undefined) data.description = entity.description;
    if (entity.dueDate !== undefined) data.dueDate = entity.dueDate;
    if (entity.attachments !== undefined) {
      data.attachments = entity.attachments.map((att) => ({
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        fileSize: att.fileSize,
      }));
    }
    if (entity.submissions !== undefined) {
      data.submissions = entity.submissions.map((sub) => ({
        studentId: new Types.ObjectId(sub.studentId),
        status: sub.status,
        submittedAt: sub.submittedAt ?? null,
        verifiedAt: sub.verifiedAt ?? null,
        remarks: sub.remarks ?? '',
        attachments: (sub.attachments || []).map((att) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
        })),
      }));
    }
    if (entity.isActive !== undefined) data.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;
    return data;
  }
}
