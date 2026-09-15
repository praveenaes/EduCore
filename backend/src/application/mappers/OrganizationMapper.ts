import { Types } from "mongoose";
import { Organization } from "../../domain/entities/Organization";

export interface IOrganizationPersistenceInput {
  _id: Types.ObjectId |string
  name: string;
  logoPath: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrganizationMapper {
  static toDomain(doc: IOrganizationPersistenceInput): Organization {
    return new Organization({
      id: doc._id.toString(),
      name: doc.name,
      logoPath: doc.logoPath,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
