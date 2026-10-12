import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICenterAddressDocument {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ICenterDocument extends Document {
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: ICenterAddressDocument;
  status: 'active' | 'inactive';
  programs: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CenterAddressSchema = new Schema<ICenterAddressDocument>(
  {
    addressLine1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CenterSchema = new Schema<ICenterDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
      default: 'Asia/Kolkata',
    },
    address: {
      type: CenterAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    programs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Program',
      },
    ],
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

CenterSchema.index({ code: 1, isDeleted: 1 });
CenterSchema.index({ name: 1, isDeleted: 1 });
CenterSchema.index({ programs: 1, isDeleted: 1 });

export const CenterModel = mongoose.model<ICenterDocument>('Center', CenterSchema);
