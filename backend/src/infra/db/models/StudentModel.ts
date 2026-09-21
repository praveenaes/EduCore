import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentDocument extends Document {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  admissionDate: Date;
  gender: string;
  dateOfBirth: Date;
  bloodGroup: string;
  nationalId: string;
  photo: string;
  phone: string;
  email: string;
  house: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  batchId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudentDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    admissionNumber: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    bloodGroup: { type: String, required: true },
    nationalId: { type: String, required: true },
    photo: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    house: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

studentSchema.index(
  { admissionNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

studentSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const StudentModel = mongoose.model<IStudentDocument>('Student', studentSchema);
