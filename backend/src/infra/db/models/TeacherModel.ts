import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacherDocument extends Document {
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: Date;
  qualifications: string;
  specializations: string;
  experience: number;
  salary: number;
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
  isDeleted: boolean;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacherDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    joiningDate: { type: Date, required: true },
    qualifications: { type: String, required: true, trim: true },
    specializations: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    salary: { type: Number, required: true, min: 0 },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date, required: true },
    bloodGroup: { type: String, required: true },
    nationalId: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    house: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and uniqueness checks
TeacherSchema.index({ employeeId: 1, isDeleted: 1 });
TeacherSchema.index({ email: 1, isDeleted: 1 });

export const TeacherModel = mongoose.model<ITeacherDocument>('Teacher', TeacherSchema);
