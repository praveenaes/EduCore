import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBatchDocument extends Document {
  name: string;
  courseId: Types.ObjectId;
  levelNumber: number;
  levelName: string;
  centerId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  teacherId?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatchDocument>(
  {
    name:          { type: String, required: true, trim: true },
    courseId:      { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    levelNumber:   { type: Number, required: true },
    levelName:     { type: String, required: true, trim: true },
    centerId:      { type: Schema.Types.ObjectId, ref: 'Center', required: true },
    academicYearId:{ type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    teacherId:     { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
    isActive:      { type: Boolean, default: true },
    isDeleted:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique batch name per course-level-center-academicYear combination (only among non-deleted records)
BatchSchema.index(
  { name: 1, courseId: 1, levelNumber: 1, centerId: 1, academicYearId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const BatchModel = mongoose.model<IBatchDocument>('Batch', BatchSchema);
