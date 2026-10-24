import mongoose, { Schema, Document, Types } from 'mongoose';
import { LeaveStatus, LeaveType, HalfDaySession } from '../../../domain/entities/LeaveRequest';

export interface ILeaveRescheduleDocument {
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  remarks?: string;
}

export interface ILeaveRequestDocument extends Document {
  studentId: Types.ObjectId;
  batchId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedAt: Date;
  isHalfDay: boolean;
  halfDaySession?: HalfDaySession;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  remarks?: string;
  rescheduleRequest?: ILeaveRescheduleDocument;
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
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDaySession: {
      type: String,
      enum: ['firstHalf', 'secondHalf'],
      default: null,
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
    rescheduleRequest: {
      type: new Schema(
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          isHalfDay: { type: Boolean, default: false },
          halfDaySession: { type: String, enum: ['firstHalf', 'secondHalf'], default: null },
          reason: { type: String, required: true, trim: true },
          status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
          requestedAt: { type: Date, default: Date.now, required: true },
          reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
          reviewedAt: { type: Date },
          remarks: { type: String, trim: true, default: '' },
        },
        { _id: false }
      ),
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ studentId: 1, appliedAt: -1 });
LeaveRequestSchema.index({ batchId: 1, status: 1, appliedAt: -1 });

export const LeaveRequestModel = mongoose.model<ILeaveRequestDocument>(
  'LeaveRequest',
  LeaveRequestSchema
);
