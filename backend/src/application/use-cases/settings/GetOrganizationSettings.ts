import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IOrganizationRepository } from "../../ports/repositories/IOrganizationRepository";
import { Organization } from "../../../domain/entities/Organization";

import { IGetOrganizationSettings } from "../../ports/use-cases/settings/IGetOrganizationSettingsUseCase";

@injectable()
export class GetOrganizationSettings implements IGetOrganizationSettings {
  constructor(
    @inject(TYPES.OrganizationRepository) private _orgRepo: IOrganizationRepository
  ) {}

  async execute(): Promise<Organization> {
    let org = await this._orgRepo.get();
    if (!org) {
      org = await this._orgRepo.create("EduCore", "");
    }
    return org;
  }
}
