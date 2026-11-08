import mongoose, { Schema, Document, Types } from 'mongoose';
import { PaymentStatus } from '../../../domain/entities/FeeAssignment';

export interface IFeeAssignmentDocument extends Document {
  title: string;
  studentId: Types.ObjectId;
  userId?: Types.ObjectId;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  refundStatus: 'none' | 'requested' | 'approved' | 'rejected';
  refundReason?: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeeAssignmentSchema = new Schema<IFeeAssignmentDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
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

FeeAssignmentSchema.index({ studentId: 1, status: 1, isDeleted: 1 });
FeeAssignmentSchema.index({ dueDate: 1, status: 1 });

export const FeeAssignmentModel = mongoose.model<IFeeAssignmentDocument>(
  'FeeAssignment',
  FeeAssignmentSchema
);
