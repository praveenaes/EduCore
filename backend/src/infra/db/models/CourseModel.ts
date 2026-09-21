import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseLevelDocument {
  levelNumber: number;
  name: string;
}

export interface ICourseDocument extends Document {
  programId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description: string;
  durationMonths: number;
  levelName: string;
  levelCount: number;
  levels: ICourseLevelDocument[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseLevelSchema = new Schema<ICourseLevelDocument>(
  {
    levelNumber: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CourseSchema = new Schema<ICourseDocument>(
  {
    programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, trim: true, default: '' },
    durationMonths: { type: Number, default: 0 },
    levelName: { type: String, required: true, trim: true },
    levelCount: { type: Number, required: true, min: 1 },
    levels: { type: [CourseLevelSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const CourseModel = mongoose.model<ICourseDocument>('Course', CourseSchema);
