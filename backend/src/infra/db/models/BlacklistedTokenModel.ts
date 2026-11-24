import { Schema, model, Document } from "mongoose";

export interface IBlacklistedTokenDocument extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedTokenDocument>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, //Delete this document when the date stored in expiresAt is reached.
    },
  },
  {
    timestamps: true,
  }
);

export const BlacklistedTokenModel = model<IBlacklistedTokenDocument>(
  "BlacklistedToken",
  blacklistedTokenSchema
);
