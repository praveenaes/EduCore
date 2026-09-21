import mongoose, { Schema, Document } from 'mongoose';

export interface IProgramDocument extends Document {
  name: string;
  code: string;
  description: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgramDocument>(
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

ProgramSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const ProgramModel = mongoose.model<IProgramDocument>('Program', ProgramSchema);