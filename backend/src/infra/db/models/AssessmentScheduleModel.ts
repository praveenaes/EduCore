import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssessmentScheduleDocument extends Document {
  assessmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  levelNumber: number;
  criteriaId: Types.ObjectId;
  batchId: Types.ObjectId;
  centerId: Types.ObjectId;
  examDate: Date;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  isGraded: boolean;
  isPublished: boolean;
  delegationStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  delegationReason?: string;
  delegatedAt?: Date;
  delegationReviewedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentScheduleSchema = new Schema<IAssessmentScheduleDocument>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
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
      min: 1,
    },
    criteriaId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentCriteria',
      required: true,
      index: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
      index: true,
    },
    examDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isGraded: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    delegationStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'],
      default: 'NONE',
      index: true,
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

// Unique index: Prevents scheduling the same criteria/exam twice for the same batch in the same event
AssessmentScheduleSchema.index(
  { assessmentId: 1, batchId: 1, criteriaId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

AssessmentScheduleSchema.index({ assessmentId: 1, isDeleted: 1 });
AssessmentScheduleSchema.index({ batchId: 1, isDeleted: 1 });
AssessmentScheduleSchema.index({ centerId: 1, examDate: 1 });

export const AssessmentScheduleModel = mongoose.model<IAssessmentScheduleDocument>(
  'AssessmentSchedule',
  AssessmentScheduleSchema
);
