import { Organization } from "../../../domain/entities/Organization";

export interface IOrganizationRepository {
  get(): Promise<Organization | null>;
  create(name: string, logoPath: string): Promise<Organization>;
  update(name: string, logoPath: string): Promise<Organization | null>;
}
