export interface OrganizationSettingsDTO {
  id?: string;
  name?: string;
  logoPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateOrganizationSettingsDTO {
  name?: string;
  logo?: string;
}

export interface UserProfileSummaryDTO {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface GetMySettingsResponseDTO {
  user: UserProfileSummaryDTO;
  profile: unknown;
}
