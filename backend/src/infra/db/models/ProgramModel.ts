import mongoose, { Schema, Document } from 'mongoose';

export interface IProgramDocument extends Document {
  name: string;
  code: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgramDocument>(
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

export const ProgramModel = mongoose.model<IProgramDocument>('Program', ProgramSchema);