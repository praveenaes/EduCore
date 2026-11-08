import mongoose, { Schema, Document, Types } from 'mongoose';
import { PaymentStatus } from '../../../domain/entities/FeeAssignment';

export interface IFeePaymentDocument extends Document {
  feeAssignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId: string;
  gatewayOrderId?: string;
  gatewayTransactionId?: string;
  gatewaySignature?: string;
  bank?: string;
  vpa?: string;
  gatewayRrn?: string;
  status: PaymentStatus;
  refundStatus: 'none' | 'requested' | 'approved' | 'rejected';
  refundReason?: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeePaymentSchema = new Schema<IFeePaymentDocument>(
  {
    feeAssignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'FeeAssignment',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'razorpay',
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gatewayOrderId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    gatewayTransactionId: {
      type: String,
      trim: true,
      default: null,
    },
    gatewaySignature: {
      type: String,
      trim: true,
      default: null,
    },
    bank: {
      type: String,
      trim: true,
      default: null,
    },
    vpa: {
      type: String,
      trim: true,
      default: null,
    },
    gatewayRrn: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'overdue', 'partial', 'failed', 'refunded'],
      default: 'pending',
      required: true,
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none',
      index: true,
    },
    refundReason: {
      type: String,
      trim: true,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FeePaymentSchema.index({ feeAssignmentId: 1, status: 1 });
FeePaymentSchema.index({ studentId: 1, status: 1 });

export const FeePaymentModel = mongoose.model<IFeePaymentDocument>(
  'FeePayment',
  FeePaymentSchema
);
