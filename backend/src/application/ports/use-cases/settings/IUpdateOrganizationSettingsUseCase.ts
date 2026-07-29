import { Organization } from "../../../../domain/entities/Organization";

export interface IUpdateOrganizationSettings {
  execute(
    data: { name: string; removeLogo?: boolean },
    file?: { buffer: Buffer; originalname: string; mimetype: string }
  ): Promise<Organization>;
}
