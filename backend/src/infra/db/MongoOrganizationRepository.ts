import { injectable } from "inversify";
import { IOrganizationRepository } from "../../application/ports/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/Organization";
import { OrganizationModel } from "./models/OrganizationModel";

@injectable()
export class MongoOrganizationRepository implements IOrganizationRepository {
  async get(): Promise<Organization | null> {
    const doc = await OrganizationModel.findOne();
    if (!doc) return null;
    return new Organization(
      doc._id.toString(),
      doc.name,
      doc.logoPath,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async create(name: string, logoPath: string): Promise<Organization> {
    const doc = await OrganizationModel.create({ name, logoPath });
    return new Organization(
      doc._id.toString(),
      doc.name,
      doc.logoPath,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async update(name: string, logoPath: string): Promise<Organization | null> {
    const doc = await OrganizationModel.findOneAndUpdate(
      {},
      { name, logoPath },
      { new: true, upsert: true }   //If a matching document exists updates or creates new
    );
    return new Organization(
      doc._id.toString(),
      doc.name,
      doc.logoPath,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
