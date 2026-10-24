import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssessmentCriteriaDocument extends Document {
  name: string;
  courseId: Types.ObjectId;
  levelNumber: number;
  subjectId: Types.ObjectId;
  assessmentType: string;
  maxMarks: number;
  passMarks: number;
  hasCe: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentCriteriaSchema = new Schema<IAssessmentCriteriaDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: ['exam', 'viva', 'assignment', 'project', 'quiz', 'other'],
      required: true,
      index: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    passMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    hasCe: {
      type: Boolean,
      default: false,
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

// Indexes
AssessmentCriteriaSchema.index(
  { name: 1, courseId: 1, levelNumber: 1, subjectId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
AssessmentCriteriaSchema.index({ courseId: 1, levelNumber: 1, isDeleted: 1 });
AssessmentCriteriaSchema.index({ subjectId: 1, isDeleted: 1 });

export const AssessmentCriteriaModel = mongoose.model<IAssessmentCriteriaDocument>(
  'AssessmentCriteria',
  AssessmentCriteriaSchema
);
