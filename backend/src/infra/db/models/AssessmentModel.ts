import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssessmentDocument extends Document {
  name: string;
  academicYearId: Types.ObjectId;
  courseId: Types.ObjectId;
  levelNumber: number;
  startDate: Date;
  endDate: Date;
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  delegationStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  delegationReason?: string;
  delegatedAt?: Date;
  delegationReviewedAt?: Date;
}

const AssessmentSchema = new Schema<IAssessmentDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    academicYearId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    levelNumber: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'GRADED', 'PUBLISHED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    delegationStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'],
      default: 'NONE',
    },
    delegationReason: {
      type: String,
      trim: true,
    },
    delegatedAt: {
      type: Date,
    },
    delegationReviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AssessmentSchema.index(
  { name: 1, academicYearId: 1, courseId: 1, levelNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
AssessmentSchema.index({ academicYearId: 1, isDeleted: 1 });
AssessmentSchema.index({ courseId: 1, levelNumber: 1, isDeleted: 1 });
AssessmentSchema.index({ status: 1, isDeleted: 1 });

export const AssessmentModel = mongoose.model<IAssessmentDocument>(
  'Assessment',
  AssessmentSchema
);
