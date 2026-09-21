import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectDocument extends Document {
  name: string;
  code: string;
  description: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

SubjectSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const SubjectModel = mongoose.model<ISubjectDocument>('Subject', SubjectSchema);
