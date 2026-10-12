import mongoose, { Schema, Document, Types } from 'mongoose';
import { HomeworkStatus } from '../../../domain/entities/Homework';

export interface IHomeworkAttachmentDocument {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface IHomeworkSubmissionDocument {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  status: HomeworkStatus;
  submittedAt?: Date | null;
  verifiedAt?: Date | null;
  remarks?: string;
  attachments: IHomeworkAttachmentDocument[];
}

export interface IHomeworkDocument extends Document {
  title: string;
  description?: string;
  batchId: Types.ObjectId;
  subjectId: Types.ObjectId | string;
  assignedBy: Types.ObjectId;
  dueDate: Date;
  attachments: IHomeworkAttachmentDocument[];
  submissions: IHomeworkSubmissionDocument[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl:  { type: String, required: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number },
  },
  { _id: false }
);

const SubmissionSchema = new Schema(
  {
    studentId:   { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'redo', 'late'],
      default: 'pending',
      required: true,
    },
    submittedAt: { type: Date, default: null },
    verifiedAt:  { type: Date, default: null },
    remarks:     { type: String, trim: true, default: '' },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true }
);

const HomeworkSchema = new Schema<IHomeworkDocument>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    batchId:     { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    subjectId:   { type: Schema.Types.Mixed, ref: 'Subject', required: true },
    assignedBy:  { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    dueDate:     { type: Date, required: true, index: true },
    attachments: { type: [AttachmentSchema], default: [] },
    submissions: { type: [SubmissionSchema], default: [] },
    isActive:    { type: Boolean, default: true },
    isDeleted:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

HomeworkSchema.index({ batchId: 1, dueDate: -1, isDeleted: 1 });
HomeworkSchema.index({ assignedBy: 1, isDeleted: 1 });
HomeworkSchema.index({ 'submissions.studentId': 1, isDeleted: 1 });

export const HomeworkModel = mongoose.model<IHomeworkDocument>('Homework', HomeworkSchema);
