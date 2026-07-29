import { Organization } from "../../../../domain/entities/Organization";

export interface IGetOrganizationSettings {
  execute(): Promise<Organization>;
}
