import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAcademicYearDocument extends Document {
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  current: boolean;
  centers: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYearDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    current: {
      type: Boolean,
      default: false,
      index: true,
    },
    centers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Center',
      },
    ],
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

// Partial unique index for active records (prevents soft-deleted conflicts)
AcademicYearSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
AcademicYearSchema.index({ name: 1, isDeleted: 1 });
AcademicYearSchema.index({ centers: 1, isDeleted: 1 });

export const AcademicYearModel = mongoose.model<IAcademicYearDocument>(
  'AcademicYear',
  AcademicYearSchema
);
