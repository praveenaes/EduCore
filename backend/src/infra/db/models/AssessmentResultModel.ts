import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssessmentResultDocument extends Document {
  assessmentId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  criteriaId: Types.ObjectId;
  batchId: Types.ObjectId;
  studentId: Types.ObjectId;
  marksObtained: number;
  ceMarksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
  remarks?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResultDocument>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentSchedule',
      required: true,
      index: true,
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
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    ceMarksObtained: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
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

// Ensure one result record per student per schedule
AssessmentResultSchema.index(
  { scheduleId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Compound index for querying batch results in an assessment
AssessmentResultSchema.index(
  { assessmentId: 1, batchId: 1, criteriaId: 1 }
);

export const AssessmentResultModel = mongoose.model<IAssessmentResultDocument>(
  'AssessmentResult',
  AssessmentResultSchema
);
