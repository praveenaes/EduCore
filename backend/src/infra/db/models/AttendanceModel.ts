import mongoose, { Schema, Document, Types } from 'mongoose';
import { AttendanceStatus } from '../../../domain/entities/Attendance';

export interface IAttendanceDocument extends Document {
  studentId: Types.ObjectId;
  batchId: Types.ObjectId;
  date: Date;
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
  markedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
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
    date: {
      type: Date,
      required: true,
      index: true,
    },
    firstHalf: {
      type: String,
      enum: ['present', 'absent'],
      default: 'absent',
      required: true,
    },
    secondHalf: {
      type: String,
      enum: ['present', 'absent'],
      default: 'absent',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One attendance record per student per calendar date
AttendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Batch index for fast daily roll-call queries
AttendanceSchema.index({ batchId: 1, date: 1 });

export const AttendanceModel = mongoose.model<IAttendanceDocument>(
  'Attendance',
  AttendanceSchema
);
