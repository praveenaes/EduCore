import { GetMySettingsResponseDTO } from "@/application/dto/settings/settingsDtos";

export interface IGetMySettings {
  execute(userId: string, role: string): Promise<GetMySettingsResponseDTO>;
}
