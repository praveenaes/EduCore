import { Organization } from "../../domain/entities/Organization";
import { IOrganizationDocument } from "../../infra/db/models/OrganizationModel";

export class OrganizationMapper {
  static toDomain(doc: IOrganizationDocument): Organization {
    return new Organization(
      doc._id.toString(),
      doc.name,
      doc.logoPath,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
