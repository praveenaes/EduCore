import { Types } from 'mongoose';
import { FeeAssignment, PaymentStatus } from '../../../domain/entities/FeeAssignment';

export interface IFeeAssignmentPersistenceInput {
  _id: Types.ObjectId | string;
  title: string;
  studentId:
    | Types.ObjectId
    | string
    | {
        _id: Types.ObjectId | string;
        firstName?: string;
        lastName?: string;
        admissionNumber?: string;
        batchId?: { _id: Types.ObjectId | string; name: string } | Types.ObjectId | string;
      };
  userId?: Types.ObjectId | string | null;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  remarks?: string | null;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FeeAssignmentMapper {
  static toDomain(doc: IFeeAssignmentPersistenceInput): FeeAssignment {
    let studentId = '';
    let studentName: string | undefined;
    let admissionNumber: string | undefined;
    let batchName: string | undefined;

    if (doc.studentId) {
      if (typeof doc.studentId === 'object' && '_id' in doc.studentId) {
        const studentDoc: any = doc.studentId;
        studentId = studentDoc._id.toString();
        if (studentDoc.firstName || studentDoc.lastName) {
          studentName = `${studentDoc.firstName || ''} ${studentDoc.lastName || ''}`.trim();
        }
        if (studentDoc.admissionNumber) {
          admissionNumber = studentDoc.admissionNumber;
        }
        if (
          studentDoc.batchId &&
          typeof studentDoc.batchId === 'object' &&
          'name' in studentDoc.batchId
        ) {
          batchName = studentDoc.batchId.name;
        }
      } else {
        studentId = doc.studentId.toString();
      }
    }

    const userId = doc.userId ? doc.userId.toString() : undefined;

    return new FeeAssignment({
      id: doc._id.toString(),
      title: doc.title,
      studentId,
      userId,
      amount: doc.amount,
      dueDate: doc.dueDate,
      status: doc.status,
      refundStatus: (doc as any).refundStatus || 'none',
      refundReason: (doc as any).refundReason || undefined,
      remarks: doc.remarks || undefined,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      studentName,
      admissionNumber,
      batchName,
    });
  }

  static toPersistence(assignment: FeeAssignment): {
    title: string;
    studentId: Types.ObjectId;
    userId: Types.ObjectId | null;
    amount: number;
    dueDate: Date;
    status: PaymentStatus;
    remarks: string | null;
    isDeleted: boolean;
  } {
    return {
      title: assignment.title,
      studentId: new Types.ObjectId(assignment.studentId),
      userId: assignment.userId ? new Types.ObjectId(assignment.userId) : null,
      amount: assignment.amount,
      dueDate: assignment.dueDate,
      status: assignment.status,
      remarks: assignment.remarks || null,
      isDeleted: assignment.isDeleted,
    };
  }

  static toPersistencePartial(assignment: Partial<FeeAssignment>): Record<string, any> {
    const updateData: Record<string, any> = {};

    if (assignment.title !== undefined) updateData.title = assignment.title;
    if (assignment.amount !== undefined) updateData.amount = assignment.amount;
    if (assignment.dueDate !== undefined) updateData.dueDate = assignment.dueDate;
    if (assignment.status !== undefined) updateData.status = assignment.status;
    if ((assignment as any).refundStatus !== undefined) updateData.refundStatus = (assignment as any).refundStatus;
    if ((assignment as any).refundReason !== undefined) updateData.refundReason = (assignment as any).refundReason;
    if (assignment.remarks !== undefined) updateData.remarks = assignment.remarks || null;
    if (assignment.isDeleted !== undefined) updateData.isDeleted = assignment.isDeleted;

    return updateData;
  }
}
