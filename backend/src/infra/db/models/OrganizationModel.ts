import { Schema, model, Document } from "mongoose";

export interface IOrganizationDocument extends Document {
  name: string;
  logoPath: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: { type: String, required: true },
    logoPath: { type: String, default: "" },
  },
  { timestamps: true }
);

export const OrganizationModel = model<IOrganizationDocument>("Organization", organizationSchema);
