import { Schema, model, Document } from "mongoose";
import { UserRole } from "../../../domain/enums/UserRole";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  passwordResetOtp?: string;
  passwordResetOtpExpiresAt?: Date;
  emailChangeOtp?: string;
  emailChangeOtpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    passwordResetOtp: { type: String },
    passwordResetOtpExpiresAt: { type: Date },
    emailChangeOtp: { type: String },
    emailChangeOtpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>("User", userSchema);
