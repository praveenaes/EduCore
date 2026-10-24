import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssessmentDocument extends Document {
  name: string;
  academicYearId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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
      enum: ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
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

AssessmentSchema.index(
  { name: 1, academicYearId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
AssessmentSchema.index({ academicYearId: 1, isDeleted: 1 });
AssessmentSchema.index({ status: 1, isDeleted: 1 });

export const AssessmentModel = mongoose.model<IAssessmentDocument>(
  'Assessment',
  AssessmentSchema
);
