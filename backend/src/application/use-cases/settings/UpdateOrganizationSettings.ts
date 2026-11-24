import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IOrganizationRepository } from "@/domain/repositories/IOrganizationRepository";
import { IStorageService } from "../../ports/services/IStorageService";
import { Organization } from "../../../domain/entities/Organization";
import { BadRequestError } from "@/shared/errors/AppError";

import { IUpdateOrganizationSettings } from "../../ports/use-cases/settings/IUpdateOrganizationSettingsUseCase";

@injectable()
export class UpdateOrganizationSettings implements IUpdateOrganizationSettings {
  constructor(
    @inject(TYPES.OrganizationRepository) private _orgRepo: IOrganizationRepository,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(
    data: { name: string; removeLogo?: boolean },
    file?: { buffer: Buffer; originalname: string; mimetype: string }
  ): Promise<Organization> {
    if (!/^[a-zA-Z\s]+$/.test(data.name)) {
      throw new BadRequestError("Organization name must contain only letters and spaces");
    }

    let org = await this._orgRepo.get();
    if (!org) {
      org = await this._orgRepo.create("EduCore", "");
    }

    let logoPath = org.logoPath || "";

    // Handle logo removal
    if (data.removeLogo === true || String(data.removeLogo) === "true") {
      if (org.logoPath) {
        try {
          await this._storageSvc.deleteFile(org.logoPath);
        } catch (error) {
          console.error("Failed to delete organization logo from S3:", error);
        }
      }
      logoPath = "";
    }

    // Handle logo upload
    if (file) {
      if (org.logoPath) {
        try {
          await this._storageSvc.deleteFile(org.logoPath);
        } catch (error) {
          console.error("Failed to delete previous organization logo from S3:", error);
        }
      }
      logoPath = await this._storageSvc.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        "organization"
      );
    }

    const updated = await this._orgRepo.update(data.name, logoPath);
    if (!updated) {
      throw new BadRequestError("Failed to update organization settings");
    }

    return updated;
  }
}
