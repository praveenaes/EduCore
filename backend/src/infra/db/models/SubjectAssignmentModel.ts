import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubjectAssignmentDocument extends Document {
  courseId: Types.ObjectId;
  levelNumber: number;
  levelName: string;
  subjectId: Types.ObjectId;
  teacherId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectAssignmentSchema = new Schema<ISubjectAssignmentDocument>(
  {
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
    levelName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
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

// Compound partial unique index: ensures the same subject cannot be added twice to the same course level among active records
SubjectAssignmentSchema.index(
  { courseId: 1, levelNumber: 1, subjectId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const SubjectAssignmentModel = mongoose.model<ISubjectAssignmentDocument>(
  'SubjectAssignment',
  SubjectAssignmentSchema
);
