import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectDocument extends Document {
  name: string;
  code: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const SubjectModel = mongoose.model<ISubjectDocument>('Subject', SubjectSchema);
