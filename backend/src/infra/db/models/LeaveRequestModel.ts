import mongoose, { Schema, Document, Types } from 'mongoose';
import { LeaveStatus, LeaveType } from '../../../domain/entities/LeaveRequest';

export interface ILeaveRequestDocument extends Document {
  studentId: Types.ObjectId;
  batchId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  remarks?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['medical', 'casual', 'family', 'other'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fast querying
LeaveRequestSchema.index({ studentId: 1, appliedAt: -1 });
LeaveRequestSchema.index({ batchId: 1, status: 1, appliedAt: -1 });

export const LeaveRequestModel = mongoose.model<ILeaveRequestDocument>(
  'LeaveRequest',
  LeaveRequestSchema
);
