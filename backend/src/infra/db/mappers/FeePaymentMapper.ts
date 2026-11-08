import { Types } from 'mongoose';
import { FeePayment } from '../../../domain/entities/FeePayment';
import { PaymentStatus } from '../../../domain/entities/FeeAssignment';

export interface IFeePaymentPersistenceInput {
  _id: Types.ObjectId | string;
  feeAssignmentId:
    | Types.ObjectId
    | string
    | { _id: Types.ObjectId | string; title?: string };
  studentId:
    | Types.ObjectId
    | string
    | {
        _id: Types.ObjectId | string;
        firstName?: string;
        lastName?: string;
        admissionNumber?: string;
      };
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId: string;
  gatewayOrderId?: string | null;
  gatewayTransactionId?: string | null;
  gatewaySignature?: string | null;
  bank?: string | null;
  vpa?: string | null;
  gatewayRrn?: string | null;
  status: PaymentStatus;
  remarks?: string | null;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FeePaymentMapper {
  static toDomain(doc: IFeePaymentPersistenceInput): FeePayment {
    let feeAssignmentId = '';
    let feeTitle: string | undefined;
    let studentId = '';
    let studentName: string | undefined;
    let admissionNumber: string | undefined;

    if (doc.feeAssignmentId) {
      const feeDoc = doc.feeAssignmentId as any;
      if (typeof doc.feeAssignmentId === 'object' && feeDoc && '_id' in feeDoc) {
        feeAssignmentId = feeDoc._id.toString();
        feeTitle = feeDoc.title;
      } else {
        feeAssignmentId = doc.feeAssignmentId.toString();
      }
    }

    if (doc.studentId) {
      if (typeof doc.studentId === 'object' && '_id' in doc.studentId) {
        const studentDoc: any = doc.studentId;
        studentId = studentDoc._id.toString();
        if (studentDoc.firstName || studentDoc.lastName) {
          studentName = `${studentDoc.firstName || ''} ${studentDoc.lastName || ''}`.trim();
        }
        admissionNumber = studentDoc.admissionNumber;
      } else {
        studentId = doc.studentId.toString();
      }
    }

    return new FeePayment({
      id: doc._id.toString(),
      feeAssignmentId,
      studentId,
      amount: doc.amount,
      paymentDate: doc.paymentDate,
      paymentMethod: doc.paymentMethod,
      transactionId: doc.transactionId,
      gatewayOrderId: doc.gatewayOrderId || undefined,
      gatewayTransactionId: doc.gatewayTransactionId || undefined,
      gatewaySignature: doc.gatewaySignature || undefined,
      bank: doc.bank || undefined,
      vpa: doc.vpa || undefined,
      gatewayRrn: doc.gatewayRrn || undefined,
      status: doc.status,
      refundStatus: (doc as any).refundStatus || 'none',
      refundReason: (doc as any).refundReason || undefined,
      remarks: doc.remarks || undefined,
      studentName,
      admissionNumber,
      feeTitle,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(payment: FeePayment): {
    feeAssignmentId: Types.ObjectId;
    studentId: Types.ObjectId;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    transactionId: string;
    gatewayOrderId: string | null;
    gatewayTransactionId: string | null;
    gatewaySignature: string | null;
    bank: string | null;
    vpa: string | null;
    gatewayRrn: string | null;
    status: PaymentStatus;
    remarks: string | null;
    isDeleted: boolean;
  } {
    return {
      feeAssignmentId: new Types.ObjectId(payment.feeAssignmentId),
      studentId: new Types.ObjectId(payment.studentId),
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      gatewayOrderId: payment.gatewayOrderId || null,
      gatewayTransactionId: payment.gatewayTransactionId || null,
      gatewaySignature: payment.gatewaySignature || null,
      bank: payment.bank || null,
      vpa: payment.vpa || null,
      gatewayRrn: payment.gatewayRrn || null,
      status: payment.status,
      remarks: payment.remarks || null,
      isDeleted: payment.isDeleted,
    };
  }

  static toPersistencePartial(payment: Partial<FeePayment>): Record<string, any> {
    const updateData: Record<string, any> = {};

    if (payment.status !== undefined) updateData.status = payment.status;
    if (payment.paymentMethod !== undefined) updateData.paymentMethod = payment.paymentMethod;
    if (payment.gatewayOrderId !== undefined) updateData.gatewayOrderId = payment.gatewayOrderId || null;
    if (payment.gatewayTransactionId !== undefined) updateData.gatewayTransactionId = payment.gatewayTransactionId || null;
    if (payment.gatewaySignature !== undefined) updateData.gatewaySignature = payment.gatewaySignature || null;
    if (payment.bank !== undefined) updateData.bank = payment.bank || null;
    if (payment.vpa !== undefined) updateData.vpa = payment.vpa || null;
    if (payment.gatewayRrn !== undefined) updateData.gatewayRrn = payment.gatewayRrn || null;
    if (payment.remarks !== undefined) updateData.remarks = payment.remarks || null;
    if ((payment as any).refundStatus !== undefined) updateData.refundStatus = (payment as any).refundStatus;
    if ((payment as any).refundReason !== undefined) updateData.refundReason = (payment as any).refundReason;
    if (payment.paymentDate !== undefined) updateData.paymentDate = payment.paymentDate;
    if (payment.isDeleted !== undefined) updateData.isDeleted = payment.isDeleted;

    return updateData;
  }
}
