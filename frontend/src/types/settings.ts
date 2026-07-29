export interface OrganizationSettings {
  name: string;
  logoPath: string;
}

export interface MySettingsResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    photo?: string;
    admissionNumber?: string;
    employeeId?: string;
    phone?: string;
    email?: string;
  };
}
